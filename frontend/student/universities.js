
let currentUser = null;
let universities = [];

window.addUniversity = function () {
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
};

// Global function for searching universities
window.searchUniversities = async function (query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;

    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '<p style="text-align: center; color: var(--muted-fg);">Start typing to search...</p>';
        return;
    }

    try {
        console.log('Searching universities with query:', query);
        const result = await API.get(`/universities?search=${encodeURIComponent(query)}`);
        console.log('Search result:', result);

        if (result.success && result.data && result.data.length > 0) {
            resultsDiv.innerHTML = result.data.map(uni => `
                <div class="search-result-item" style="padding: 1rem; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s;" onclick="addUniversityToShortlist('${uni.id}')">
                    <div style="font-weight: 500;">${uni.name}</div>
                    <div style="font-size: 0.85rem; color: var(--muted-fg); margin-top: 0.25rem;">
                        ${uni.country || 'Unknown'} ${uni.ranking ? `• Rank #${uni.ranking}` : ''} ${uni.acceptance_rate ? `• Acceptance Rate: ${uni.acceptance_rate}%` : ''}
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
};

// Global function for adding university to shortlist
window.addUniversityToShortlist = async function (uniId) {
    try {
        console.log('Adding university to shortlist:', uniId);
        const result = await API.post('/applications', {
            universityId: uniId,
            notes: 'Added to shortlist'
        });
        console.log('Add to shortlist result:', result);

        if (result.success) {
            Toast.success('University added to shortlist!');
            document.querySelector('.modal')?.remove();
            await loadUniversities();
        }
    } catch (error) {
        console.error('Error adding university:', error);
        Toast.error(error.message || 'Failed to add university');
    }
};

function calculateProgress(status) {
    switch (status) {
        case 'not_started': return 0;
        case 'in_progress': return 50;
        case 'submitted': return 75;
        case 'accepted': return 100;
        case 'rejected': return 100;
        default: return 0;
    }
}

async function loadUniversities() {
    console.log('Loading universities...');
    try {
        const studentId = currentUser.student?.id || currentUser.id;
        console.log('Student ID:', studentId);

        const applicationsResult = await API.get(`/applications?studentId=${studentId}`);
        console.log('Applications result:', applicationsResult);
        const applications = applicationsResult.data || [];

        const universityPromises = applications.map(async (app) => {
            try {
                console.log('Fetching university:', app.university_id);
                const uni = await API.get(`/universities/${app.university_id}`);
                console.log('University data:', uni);
                return {
                    ...uni,
                    applicationId: app.id,
                    applicationStatus: app.status,
                    progress: calculateProgress(app.status),
                    application_deadline: app.deadline
                };
            } catch (error) {
                console.error('Error loading university:', error);
                return null;
            }
        });

        universities = (await Promise.all(universityPromises)).filter(u => u !== null);
        console.log('Loaded universities:', universities);
        renderUniversities();
    } catch (error) {
        console.error('Error loading universities:', error);
        Toast.error('Failed to load universities');
    }
}

function renderUniversities() {
    const container = document.querySelector('.content-area');
    if (!container) return;

    const universitiesHTML = `
        <h2 style="margin-bottom: 1rem;">University Shortlist</h2>
        <div style="margin-bottom: 1.5rem;">
            <button class="btn btn-primary" onclick="addUniversity()">+ Add University</button>
        </div>
        ${universities.length === 0 ?
            '<div class="card"><p style="text-align: center; color: var(--muted-fg);">No universities in your shortlist yet. Click "Add University" to get started.</p></div>' :
            universities.map(uni => `
                <div class="card university-card" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="margin: 0 0 0.5rem 0;">${uni.name}</h3>
                            <p style="margin: 0; color: var(--muted-fg);">
                                ${uni.location || uni.country} • Ranking: #${uni.ranking || 'N/A'}
                            </p>
                        </div>
                        <span class="badge ${getStatusBadgeClass(uni.applicationStatus)}">${uni.applicationStatus || 'not started'}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 0.85rem; color: var(--muted-fg);">Application Deadline</div>
                            <div style="font-weight: 500;">${uni.application_deadline ? new Date(uni.application_deadline).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--muted-fg);">Acceptance Rate</div>
                            <div style="font-weight: 500;">${uni.acceptance_rate || 'N/A'}%</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--muted-fg);">Tuition (Annual)</div>
                            <div style="font-weight: 500;">$${(uni.tuition_fees || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.9rem;">Application Progress</span>
                            <span style="font-size: 0.9rem; font-weight: 500;">${uni.progress || 0}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${uni.progress || 0}%; background: var(--primary);"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="viewUniversityDetails('${uni.id}')">View Details</button>
                        <button class="btn btn-primary" onclick="continueApplication('${uni.id}')">Continue Application</button>
                        <button class="btn btn-outline" onclick="removeUniversity('${uni.applicationId}')">Remove</button>
                    </div>
                </div>
            `).join('')
        }
    `;

    container.innerHTML = universitiesHTML;
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
                    <strong>Tuition Fee:</strong> $${uni.tuition_fees.toLocaleString()}/year<br>
                    <strong>Acceptance Rate:</strong> ${uni.acceptance_rate}%<br>
                    <strong>Application Deadline:</strong> ${new Date(uni.application_deadline).toLocaleDateString()}<br>
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

async function removeUniversity(applicationId) {
    if (!confirm('Are you sure you want to remove this university from your shortlist?')) {
        return;
    }

    try {
        await API.delete(`/applications/${applicationId}`);
        Toast.success('University removed from shortlist');
        await loadUniversities();
    } catch (error) {
        console.error('Error removing university:', error);
        Toast.error(error.message || 'Failed to remove university');
    }
}

if (!document.getElementById('university-styles')) {
    let style = document.createElement('style');
    style.id = 'university-styles';
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
}
