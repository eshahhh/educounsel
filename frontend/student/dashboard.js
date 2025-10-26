let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('student');
    if (!currentUser) return;

    updateUserInfo();
    await loadDashboardData();
    initMiniCalendar();
});


window.updateUserInfo = function () {
    // Support different name fields that may come from the API
    const userName = currentUser?.full_name || currentUser?.fullName || currentUser?.name || 'Student';
    const firstName = userName.split(' ')[0];

    const userNameElements = document.querySelectorAll('#user-name, #welcome-name');
    userNameElements.forEach(el => {
        el.textContent = firstName;
    });
};

async function loadDashboardData() {
    try {
        // Fetch dashboard for the authenticated student.
        // Use the /students/me/dashboard endpoint so we don't rely on client-side id inference.
        const dashboardResult = await API.get('/students/me/dashboard');
        // Some backends return { success, data } while others may return the payload directly.
        const dashboardData = dashboardResult.data || dashboardResult;

        if (!dashboardData) {
            throw new Error('Invalid dashboard response');
        }

        // Persist minimal user info if provided by the API
        if (dashboardData.student && dashboardData.student.name) {
            currentUser = Object.assign({}, currentUser, { name: dashboardData.student.name });
            Storage.set(Config.STORAGE_KEYS.USER_DATA, currentUser);
            updateUserInfo();
        }

        updateStatsCards(dashboardData.stats || {});
        updateProgressBars(dashboardData.progressTracking || {});
        updateCounselorInfo(dashboardData.counselor || null);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        Toast.error('Failed to load dashboard data');
    }
}

function updateStatsCards(stats) {
    const statCards = document.querySelectorAll('.stat-card');

    if (statCards[0]) {
        statCards[0].querySelector('.value').textContent = `${stats.documentsUploaded}/${stats.documentsTotal}`;
    }

    if (statCards[1]) {
        statCards[1].querySelector('.value').textContent = stats.essaysDrafted;
        statCards[1].querySelector('.subtext').textContent = `${stats.essaysReviewed} reviewed`;
    }

    if (statCards[2]) {
        statCards[2].querySelector('.value').textContent = stats.testsScheduled;
    }

    if (statCards[3]) {
        statCards[3].querySelector('.value').textContent = stats.applicationsInProgress;
    }
}

function updateProgressBars(progress) {
    const progressBars = document.querySelectorAll('.progress-fill');
    const progressTexts = document.querySelectorAll('.progress-bar').length > 0 ?
        Array.from(document.querySelectorAll('.progress-bar')).map(pb =>
            pb.previousElementSibling?.querySelector('span:last-child')
        ) : [];

    if (progressBars[0]) {
        progressBars[0].style.width = progress.documents + '%';
        if (progressTexts[0]) progressTexts[0].textContent = progress.documents + '%';
    }

    if (progressBars[1]) {
        progressBars[1].style.width = progress.essays + '%';
        if (progressTexts[1]) progressTexts[1].textContent = progress.essays + '%';
    }

    if (progressBars[2]) {
        progressBars[2].style.width = progress.testPrep + '%';
        if (progressTexts[2]) progressTexts[2].textContent = progress.testPrep + '%';
    }

    if (progressBars[3]) {
        progressBars[3].style.width = progress.applications + '%';
        if (progressTexts[3]) progressTexts[3].textContent = progress.applications + '%';
    }
}

function updateCounselorInfo(counselor) {
    const counselorSection = document.querySelector('.card h3');

    if (counselorSection && counselorSection.textContent.includes('Counselor')) {
        const counselorCard = counselorSection.closest('.card');
        const counselorInfo = counselorCard.querySelector('div > div:first-child');
        if (counselorInfo) {
            counselorInfo.innerHTML = `
                <div style="font-weight: 500; margin-bottom: 0.25rem;">${counselor ? counselor.name : 'Not Assigned'}</div>
                <div style="font-size: 0.9rem; color: var(--muted-fg);">${counselor ? counselor.email : ''}</div>
            `;
        }
    }
}

function initMiniCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    calendarGrid.innerHTML = dayHeaders.map(day =>
        `<div style="text-align: center; font-size: 0.75rem; color: var(--muted-fg); padding: 0.25rem;">${day}</div>`
    ).join('');

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        calendarGrid.innerHTML += `
            <div style="text-align: center; font-size: 0.8rem; padding: 0.25rem; 
                ${isToday ? 'background: var(--primary); color: white; border-radius: 4px;' : ''} 
                cursor: pointer;">
                ${day}
            </div>
        `;
    }

    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gap = '0.25rem';
}

// Global function for opening message modal - accessible from dashboard.html
window.openMessageModal = function () {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('messageText').value = '';
    }
};

// (duplicate closeMessageModal removed)

// Global function for closing message modal
window.closeMessageModal = function () {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Global function for sending message - accessible from dashboard.html
window.sendMessage = async function () {
    const messageText = document.getElementById('messageText').value;

    if (!Validator.required(messageText)) {
        Toast.error('Message cannot be empty');
        return;
    }

    try {
        // Get user's counselor - we'd typically fetch this from the profile
        const result = await API.post('/messages', {
            recipientId: currentUser.counselor?.id || '',
            subject: 'Message from Student',
            content: messageText
        });

        if (result.success) {
            Toast.success('Message sent successfully!');
            closeMessageModal();
        }
    } catch (error) {
        console.error('Error sending message:', error);
        Toast.error(error.message || 'Failed to send message');
    }
};

window.onclick = function (event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeMessageModal();
    }
}
