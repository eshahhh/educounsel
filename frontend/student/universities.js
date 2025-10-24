let currentUser = null;
let universities = [];

document.addEventListener('DOMContentLoaded', async function () {
    currentUser = checkAuth('student');
    if (!currentUser) return;

    updateUserName();

    await loadUniversities();
});

function updateUserName() {
    const userName = currentUser.name || 'Student';
    const firstName = userName.split(' ')[0];
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = firstName;
}

async function loadUniversities() {
    try {
        let result;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.getUniversities(currentUser.id);
        } else {
            result = await API.get(Config.ENDPOINTS.STUDENTS.UNIVERSITIES.replace(':id', currentUser.id));
        }

        if (result.success) {
            universities = result.data;
            renderUniversities();
        }
    } catch (error) {
        console.error('Error loading universities:', error);
        Toast.error('Failed to load universities');
    }
}

function renderUniversities() {
    const container = document.querySelector('.content-area > div[style*="grid"]');
    if (!container) return;

    if (universities.length === 0) {
        container.innerHTML = '<p style="color: var(--muted-fg); text-align: center; padding: 2rem;">No universities in your shortlist yet</p>';
        return;
    }

    container.innerHTML = universities.map(uni => `
        <div class="card university-card" data-uni-id="${uni.id}">
            <div class="university-image">
                ${uni.imageUrl ? `<img src="${uni.imageUrl}" alt="${uni.name}">` : `
                    <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        border-radius: 6px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; 
                        color: white; font-size: 0.9rem; text-align: center; padding: 1rem;">
                        ${uni.name}
                    </div>
                `}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h3>${uni.name}</h3>
                <span class="badge ${getStatusBadgeClass(uni.applicationStatus)}">${uni.applicationStatus}</span>
            </div>
            <div class="university-info">
                <div style="font-size: 0.85rem; color: var(--muted-fg); margin-bottom: 0.5rem;">
                    ${uni.country} • Rank #${uni.ranking}
                </div>
                <div style="font-size: 0.85rem; color: var(--muted-fg); margin-bottom: 0.5rem;">
                    $${uni.tuitionFee.toLocaleString()}/year
                </div>
                <div style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                        <span>Application Progress</span>
                        <span>${uni.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${uni.progress}%;"></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn btn-outline" style="flex: 1;" onclick="viewUniversityDetails(${uni.id})">View Details</button>
                <button class="btn btn-ghost" onclick="removeUniversity(${uni.id})" title="Remove">Remove</button>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    const classes = {
        'accepted': 'badge-success',
        'applied': 'badge-warning',
        'in-progress': '',
        'rejected': 'badge-error'
    };
    return classes[status] || '';
}

function viewUniversityDetails(uniId) {
    const uni = universities.find(u => u.id === uniId);
    if (!uni) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2>${uni.name}</h2>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <strong>Country:</strong> ${uni.country}<br>
                    <strong>Ranking:</strong> #${uni.ranking}<br>
                    <strong>Tuition Fee:</strong> $${uni.tuitionFee.toLocaleString()}/year<br>
                    <strong>Acceptance Rate:</strong> ${uni.acceptanceRate}%<br>
                    <strong>Application Deadline:</strong> ${new Date(uni.applicationDeadline).toLocaleDateString()}<br>
                    <strong>Status:</strong> <span class="badge ${getStatusBadgeClass(uni.applicationStatus)}">${uni.applicationStatus}</span>
                </div>
                <div>
                    <strong>Application Progress:</strong>
                    <div class="progress-bar" style="margin-top: 0.5rem;">
                        <div class="progress-fill" style="width: ${uni.progress}%;"></div>
                    </div>
                    <div style="text-align: right; font-size: 0.85rem; margin-top: 0.25rem; color: var(--muted-fg);">
                        ${uni.progress}% Complete
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn-primary" onclick="continueApplication(${uni.id})">Continue Application</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function continueApplication(uniId) {
    const uni = universities.find(u => u.id === uniId);
    if (uni) {
        Toast.info(`Continuing application for ${uni.name}...`);
    }
}

async function removeUniversity(uniId) {
    const uni = universities.find(u => u.id === uniId);
    if (!uni) return;

    if (!confirm(`Remove ${uni.name} from your shortlist?`)) return;

    try {
        Toast.success(`${uni.name} removed from shortlist`);
        universities = universities.filter(u => u.id !== uniId);
        renderUniversities();
    } catch (error) {
        console.error('Error removing university:', error);
        Toast.error('Failed to remove university');
    }
}

function addUniversity() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2>Add University</h2>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Search Universities</label>
                    <input type="text" id="uniSearch" class="form-input" placeholder="Search by name or country..." oninput="searchUniversities(this.value)">
                </div>
                <div id="searchResults" style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
                    <p style="text-align: center; color: var(--muted-fg);">Start typing to search...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function searchUniversities(query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;

    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '<p style="text-align: center; color: var(--muted-fg);">Start typing to search...</p>';
        return;
    }

    try {
        let result;

        if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
            result = await MockData.searchUniversities(query);
        } else {
            result = await API.get(`${Config.ENDPOINTS.UNIVERSITIES.SEARCH}?q=${encodeURIComponent(query)}`);
        }

        if (result.success && result.data.length > 0) {
            resultsDiv.innerHTML = result.data.map(uni => `
                <div class="search-result-item" style="padding: 1rem; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s;" onclick="addUniversityToShortlist(${uni.id})">
                    <div style="font-weight: 500;">${uni.name}</div>
                    <div style="font-size: 0.85rem; color: var(--muted-fg); margin-top: 0.25rem;">
                        ${uni.country} • Rank #${uni.ranking} • Acceptance Rate: ${uni.acceptanceRate}%
                    </div>
                </div>
            `).join('');
        } else {
            resultsDiv.innerHTML = '<p style="text-align: center; color: var(--muted-fg);">No universities found</p>';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = '<p style="text-align: center; color: var(--error);">Error searching universities</p>';
    }
}

async function addUniversityToShortlist(uniId) {
    try {
        Toast.success('University added to shortlist!');

        const modal = document.querySelector('.modal');
        if (modal) modal.remove();

        await loadUniversities();
    } catch (error) {
        console.error('Error adding university:', error);
        Toast.error('Failed to add university');
    }
}

const style = document.createElement('style');
style.textContent = `
    .university-card {
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .university-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .search-result-item:hover {
        background: var(--muted);
        border-color: var(--primary) !important;
    }
`;
document.head.appendChild(style);
