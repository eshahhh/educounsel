let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('student');
    if (!currentUser) return;

    updateUserInfo();
    await loadDashboardData();
    initMiniCalendar();
});

function updateUserInfo() {
    const userName = currentUser.name || 'Student';
    const firstName = userName.split(' ')[0];

    const userNameElements = document.querySelectorAll('#user-name, #welcome-name');
    userNameElements.forEach(el => {
        el.textContent = firstName;
    });
}

async function loadDashboardData() {
    try {
        let statsResult, progressResult;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            statsResult = await MockData.getStudentStats(currentUser.id);
            progressResult = statsResult;
        } else {
            statsResult = await API.get(Config.ENDPOINTS.STUDENTS.STATS.replace(':id', currentUser.id));
            progressResult = await API.get(Config.ENDPOINTS.STUDENTS.PROGRESS.replace(':id', currentUser.id));
        }

        if (statsResult.success) {
            updateStatsCards(statsResult.data);
            updateProgressBars(statsResult.data.progressTracking);
        }

        await loadCounselorInfo();

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

async function loadCounselorInfo() {
    try {
        let result;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.getStudentProfile(currentUser.id);
        } else {
            result = await API.get(Config.ENDPOINTS.STUDENTS.PROFILE.replace(':id', currentUser.id));
        }

        if (result.success && result.data.counselor) {
            const counselor = result.data.counselor;
            const counselorSection = document.querySelector('.card h3:contains("Assigned Counselor")');

            if (counselorSection) {
                const counselorCard = counselorSection.closest('.card');
                const counselorName = counselorCard.querySelector('div > div:first-child');
                if (counselorName) {
                    counselorName.innerHTML = `
                        <div style="font-weight: 500; margin-bottom: 0.25rem;">${counselor.name}</div>
                        <div style="font-size: 0.9rem; color: var(--muted-fg);">Response time: ~${counselor.responseTime}</div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Error loading counselor info:', error);
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

function openMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('messageText').value = '';
    }
}

function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function sendMessage() {
    const messageText = document.getElementById('messageText').value;

    if (!Validator.required(messageText)) {
        Toast.error('Please enter a message');
        return;
    }

    try {
        let result;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.sendMessage({
                from: currentUser.name,
                fromId: currentUser.id,
                to: 'Counselor',
                toId: currentUser.counselorId || 1,
                subject: 'New Message',
                message: messageText
            });
        } else {
            result = await API.post(Config.ENDPOINTS.MESSAGES.SEND, {
                to: currentUser.counselorId,
                message: messageText
            });
        }

        if (result.success) {
            Toast.success('Message sent successfully!');
            closeMessageModal();
        } else {
            Toast.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        Toast.error('An error occurred');
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeMessageModal();
    }
}
