let currentUser = null;
let students = [];
let counselors = [];

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('admin') || checkAuth('student');
    if (!currentUser) return;

    await loadAdminData();
    initDragAndDrop();
});

async function loadAdminData() {
    try {
        let statsResult, studentsResult;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            statsResult = await MockData.getAdminStats();
            studentsResult = await MockData.getAllStudents();
            counselors = MockData.counselors;
        } else {
            statsResult = await API.get(Config.ENDPOINTS.ADMIN.DASHBOARD);
            studentsResult = await API.get(Config.ENDPOINTS.ADMIN.STUDENTS);
            const counselorsResult = await API.get(Config.ENDPOINTS.COUNSELORS.LIST);
            counselors = counselorsResult.data;
        }

        if (statsResult.success) {
            updateStatsCards(statsResult.data);
            renderWeeklySignupsChart(statsResult.data.weeklySignups);
        }

        if (studentsResult.success) {
            students = studentsResult.data;
            renderStudentsTable();
            renderDraggableStudents();
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
        Toast.error('Failed to load dashboard data');
    }
}

function updateStatsCards(stats) {
    const statCards = document.querySelectorAll('.stat-card');

    if (statCards[0]) {
        statCards[0].querySelector('.value').textContent = stats.totalStudents;
    }

    if (statCards[1]) {
        statCards[1].querySelector('.value').textContent = stats.newSignups7d;
    }

    if (statCards[2]) {
        statCards[2].querySelector('.value').textContent = 'High';
        statCards[2].querySelector('.subtext').textContent = `${stats.activeCounselors} active counselors`;
    }

    if (statCards[3]) {
        statCards[3].querySelector('.value').textContent = stats.activeSchools;
    }
}

function renderWeeklySignupsChart(data) {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    if (!chartPlaceholder) return;

    const maxValue = Math.max(...data);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    chartPlaceholder.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; gap: 0.5rem;">
            ${data.map((value, index) => `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="font-size: 0.75rem; color: var(--muted-fg); margin-bottom: 0.5rem;">${value}</div>
                    <div style="width: 100%; background: var(--primary); border-radius: 4px 4px 0 0; 
                        height: ${(value / maxValue) * 150}px; transition: height 0.3s;"></div>
                    <div style="font-size: 0.75rem; color: var(--muted-fg); margin-top: 0.5rem;">${days[index]}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderStudentsTable() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = students.slice(0, 10).map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.country}</td>
            <td><span class="badge ${getStatusBadge(student.profileComplete)}">${getStatusText(student.profileComplete)}</span></td>
            <td>${student.counselor || 'Unassigned'}</td>
            <td>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" 
                    onclick="viewStudent(${student.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(progress) {
    if (progress >= 80) return 'badge-success';
    if (progress >= 50) return 'badge-warning';
    return '';
}

function getStatusText(progress) {
    if (progress >= 80) return 'Completed';
    if (progress >= 50) return 'In Progress';
    return 'Started';
}

function renderDraggableStudents() {
    const dragContainer = document.getElementById('studentDrag');
    if (!dragContainer) return;

    dragContainer.innerHTML = students.slice(0, 5).map(student => `
        <div class="badge" draggable="true" data-student-id="${student.id}" data-student-name="${student.name}"
            style="cursor: move; padding: 0.5rem 1rem;">
            ${student.name}
        </div>
    `).join('');
}

function initDragAndDrop() {
    document.addEventListener('dragstart', function (e) {
        if (e.target.matches('[draggable="true"]')) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('studentId', e.target.dataset.studentId);
            e.dataTransfer.setData('studentName', e.target.dataset.studentName);
        }
    });

    const dropZones = document.querySelectorAll('.counselor-drop');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.style.background = 'rgba(78, 205, 196, 0.2)';
            this.style.borderColor = 'var(--primary)';
        });

        zone.addEventListener('dragleave', function (e) {
            this.style.background = 'var(--muted)';
            this.style.borderColor = 'var(--border)';
        });

        zone.addEventListener('drop', async function (e) {
            e.preventDefault();
            this.style.background = 'var(--muted)';
            this.style.borderColor = 'var(--border)';

            const studentId = parseInt(e.dataTransfer.getData('studentId'));
            const studentName = e.dataTransfer.getData('studentName');
            const counselorName = this.dataset.counselor;

            await assignCounselorToStudent(studentId, studentName, counselorName);
        });
    });
}

async function assignCounselorToStudent(studentId, studentName, counselorName) {
    try {
        const counselor = counselors.find(c => c.name === counselorName);
        if (!counselor) {
            Toast.error('Counselor not found');
            return;
        }

        let result;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.assignCounselor(studentId, counselor.id);
        } else {
            result = await API.post(Config.ENDPOINTS.ADMIN.ASSIGN_COUNSELOR, {
                studentId: studentId,
                counselorId: counselor.id
            });
        }

        if (result.success) {
            Toast.success(`${studentName} assigned to ${counselorName}`);

            const student = students.find(s => s.id === studentId);
            if (student) {
                student.counselor = counselorName;
                student.counselorId = counselor.id;
            }

            renderStudentsTable();
        } else {
            Toast.error('Failed to assign counselor');
        }
    } catch (error) {
        console.error('Error assigning counselor:', error);
        Toast.error('An error occurred');
    }
}

function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2>Student Details</h2>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <strong>Name:</strong> ${student.name}<br>
                    <strong>Email:</strong> ${student.email}<br>
                    <strong>Country:</strong> ${student.country}<br>
                    <strong>Phone:</strong> ${student.phone || 'N/A'}<br>
                    <strong>Counselor:</strong> ${student.counselor || 'Unassigned'}<br>
                    <strong>Profile Complete:</strong> ${student.profileComplete}%<br>
                    <strong>Joined:</strong> ${new Date(student.createdAt).toLocaleDateString()}
                </div>
                <div>
                    <strong>Progress:</strong>
                    <div class="progress-bar" style="margin-top: 0.5rem;">
                        <div class="progress-fill" style="width: ${student.profileComplete}%;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
