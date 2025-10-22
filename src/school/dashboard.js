let currentUser = null;
let students = [];

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('school') || checkAuth('student');
    if (!currentUser) return;

    updateSchoolName();

    await loadSchoolData();
});

function updateSchoolName() {
    const schoolName = currentUser.name || 'School';
    const schoolNameEl = document.getElementById('school-name');
    if (schoolNameEl) {
        schoolNameEl.textContent = schoolName.split(' ')[0];
    }
}

async function loadSchoolData() {
    try {
        let statsResult;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            statsResult = await MockData.getSchoolStats(currentUser.id);
            const allStudentsResult = await MockData.getAllStudents();
            students = allStudentsResult.data.slice(0, 5);
        } else {
            statsResult = await API.get(Config.ENDPOINTS.SCHOOLS.STATS.replace(':id', currentUser.id));
            const studentsResult = await API.get(Config.ENDPOINTS.SCHOOLS.STUDENTS.replace(':id', currentUser.id));
            students = studentsResult.data;
        }

        if (statsResult.success) {
            updateStatsCards(statsResult.data);
            renderCharts(statsResult.data);
        }

        renderStudentsTable();
    } catch (error) {
        console.error('Error loading school data:', error);
        Toast.error('Failed to load dashboard data');
    }
}

function updateStatsCards(stats) {
    const statCards = document.querySelectorAll('.stat-card');

    if (statCards[0]) {
        statCards[0].querySelector('.value').textContent = stats.totalStudents;
    }

    if (statCards[1]) {
        statCards[1].querySelector('.value').textContent = stats.acceptances;
    }

    if (statCards[2]) {
        statCards[2].querySelector('.value').textContent = stats.topUniversities;
    }

    if (statCards[3]) {
        statCards[3].querySelector('.value').textContent = stats.pendingMessages;
    }
}

function renderCharts(stats) {
    const countryChart = document.querySelector('.chart-placeholder');
    if (countryChart && countryChart.textContent.includes('Acceptances by Country')) {
        countryChart.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem; height: 200px; justify-content: center;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="flex: 1; background: var(--muted); border-radius: 4px; overflow: hidden;">
                        <div style="background: var(--primary); height: 30px; width: 70%;"></div>
                    </div>
                    <span style="min-width: 100px; font-size: 0.9rem;">USA (15)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="flex: 1; background: var(--muted); border-radius: 4px; overflow: hidden;">
                        <div style="background: #96ceb4; height: 30px; width: 45%;"></div>
                    </div>
                    <span style="min-width: 100px; font-size: 0.9rem;">UK (10)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="flex: 1; background: var(--muted); border-radius: 4px; overflow: hidden;">
                        <div style="background: #ff6b6b; height: 30px; width: 32%;"></div>
                    </div>
                    <span style="min-width: 100px; font-size: 0.9rem;">Canada (7)</span>
                </div>
            </div>
        `;
    }

    const statusCharts = document.querySelectorAll('.chart-placeholder');
    if (statusCharts[1] && statusCharts[1].textContent.includes('Application Status')) {
        statusCharts[1].innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                <div style="position: relative; width: 150px; height: 150px;">
                    <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" stroke-width="20"></circle>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" stroke-width="20"
                            stroke-dasharray="${22 * 2.51} 251" stroke-linecap="round"></circle>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#96ceb4" stroke-width="20"
                            stroke-dasharray="${15 * 2.51} 251" stroke-dashoffset="${-22 * 2.51}" stroke-linecap="round"></circle>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ff6b6b" stroke-width="20"
                            stroke-dasharray="${27 * 2.51} 251" stroke-dashoffset="${-(22 + 15) * 2.51}" stroke-linecap="round"></circle>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${stats.totalStudents}</div>
                        <div style="font-size: 0.75rem; color: var(--muted-fg);">Students</div>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--primary);"></div>
                    <span style="font-size: 0.85rem;">In Progress (35%)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #96ceb4;"></div>
                    <span style="font-size: 0.85rem;">Accepted (23%)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff6b6b;"></div>
                    <span style="font-size: 0.85rem;">Applied (42%)</span>
                </div>
            </div>
        `;
    }
}

function renderStudentsTable() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    const sampleStudents = students.length > 0 ? students : [
        { name: 'Aisha', status: 'In Progress', counselor: 'Ms. Khan', progress: 60 },
        { name: 'Omar', status: 'Completed', counselor: 'Mr. Ali', progress: 100 },
        { name: 'Sara', status: 'Accepted', counselor: 'Ms. Khan', progress: 100 },
        { name: 'Ahmed', status: 'Applied', counselor: 'Mr. Ali', progress: 85 },
        { name: 'Fatima', status: 'In Progress', counselor: 'Ms. Khan', progress: 45 }
    ];

    tbody.innerHTML = sampleStudents.map(student => `
        <tr>
            <td>${student.name}</td>
            <td><span class="badge ${getStatusBadgeClass(student.status)}">${student.status}</span></td>
            <td>${student.counselor}</td>
            <td>${student.progress || student.profileComplete || 0}%</td>
        </tr>
    `).join('');
}

function getStatusBadgeClass(status) {
    const classes = {
        'Accepted': 'badge-success',
        'Completed': 'badge-success',
        'Applied': 'badge-warning',
        'In Progress': ''
    };
    return classes[status] || '';
}

const searchInput = document.querySelector('input[placeholder="Search..."]');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('table tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}
