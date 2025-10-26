if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name || 'Student';

        // Load current profile data
        await loadProfileData();

        // Handle form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                await updateProfile();
            });
        }
    });

    async function loadProfileData() {
        try {
            const result = await API.get('/auth/me');
            if (result.user && result.user.student) {
                const student = result.user.student;

                // Populate form fields
                document.getElementById('gradeLevel').value = student.grade_level || '';
                document.getElementById('targetMajor').value = student.target_major || '';
                document.getElementById('gpa').value = student.gpa || '';
                document.getElementById('satScore').value = student.sat_score || '';
                document.getElementById('actScore').value = student.act_score || '';
                document.getElementById('interests').value = student.interests || '';
                document.getElementById('extracurriculars').value = student.extracurriculars || '';
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Toast.error('Failed to load profile data');
        }
    }

    async function updateProfile() {
        try {
            const user = getCurrentUser();
            const studentId = user.student?.id || user.id;

            const gradeLevel = document.getElementById('gradeLevel').value;
            const gpa = parseFloat(document.getElementById('gpa').value);
            const satScore = parseInt(document.getElementById('satScore').value);
            const actScore = parseInt(document.getElementById('actScore').value);
            const interests = document.getElementById('interests').value;
            const extracurriculars = document.getElementById('extracurriculars').value;
            const targetMajor = document.getElementById('targetMajor').value;

            // Validate GPA
            if (gpa && (gpa < 0 || gpa > 4.0)) {
                Toast.error('GPA must be between 0 and 4.0');
                return;
            }

            // Validate SAT
            if (satScore && (satScore < 400 || satScore > 1600)) {
                Toast.error('SAT score must be between 400 and 1600');
                return;
            }

            // Validate ACT
            if (actScore && (actScore < 1 || actScore > 36)) {
                Toast.error('ACT score must be between 1 and 36');
                return;
            }

            // Match backend schema: gradeLevel, gpa, satScore, actScore, extracurriculars, interests, targetMajor
            const updateData = {};
            if (gradeLevel) updateData.gradeLevel = gradeLevel;
            if (!isNaN(gpa)) updateData.gpa = gpa;
            if (!isNaN(satScore)) updateData.satScore = satScore;
            if (!isNaN(actScore)) updateData.actScore = actScore;
            if (interests) updateData.interests = interests;
            if (extracurriculars) updateData.extracurriculars = extracurriculars;
            if (targetMajor) updateData.targetMajor = targetMajor;

            await API.put(`/students/${studentId}`, updateData);

            Toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            Toast.error(error.message || 'Failed to update profile');
        }
    }
}

if (window.location.pathname.includes('essays.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name || 'Student';

        await loadEssays(user.student?.id || user.id);
    });

    async function loadEssays(studentId) {
        try {
            const result = await API.get(`/essays?studentId=${studentId}`);
            if (result.success && result.data) {
                renderEssays(result.data);
            }
        } catch (error) {
            console.error('Error loading essays:', error);
            Toast.error('Failed to load essays');
        }
    }

    function renderEssays(essays) {
        const container = document.querySelector('.content-area .space-y-4');
        if (!container) return;

        if (essays.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <p style="text-align: center; color: var(--muted-fg);">No essays yet. Click "Add New Essay" to get started!</p>
                </div>
                <button class="btn btn-primary" onclick="addNewEssay()">+ Add New Essay</button>
            `;
            return;
        }

        container.innerHTML = essays.map(essay => `
            <div class="card">
                <div style="padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem;">
                    <h3>${essay.title || 'Untitled Essay'}</h3>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.9rem; color: var(--muted-fg);">
                        Status: ${essay.status || 'draft'}
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        ${essay.status === 'reviewed' || essay.status === 'final' ?
                '<span class="badge badge-success">Reviewed</span>' :
                '<span class="badge">Draft</span>'}
                        <button class="btn btn-outline" onclick="downloadEssay('${essay.download_url}')">Download</button>
                        <button class="btn btn-outline" onclick="uploadNewVersion('${essay.id}')">Upload New Version</button>
                    </div>
                </div>
            </div>
        `).join('') + '<button class="btn btn-primary" onclick="addNewEssay()">+ Add New Essay</button>';
    }

    window.downloadEssay = function (url) {
        window.open(url, '_blank');
    };

    window.uploadNewVersion = function (essayId) {
        const modal = document.getElementById('essayModal');
        const modalTitle = document.getElementById('modalTitle');
        const essayIdInput = document.getElementById('essayId');
        const essayForm = document.getElementById('essayForm');

        if (modal && modalTitle && essayIdInput && essayForm) {
            modalTitle.textContent = 'Upload New Version';
            essayIdInput.value = essayId;
            // Hide title and prompt fields for update
            document.getElementById('essayTitle').parentElement.style.display = 'none';
            document.getElementById('essayPrompt').parentElement.style.display = 'none';
            modal.style.display = 'block';
        }
    };

    window.viewEssay = function (essayId) {
        Toast.info(`Viewing essay: ${essayId}`);
    };
}

// Global function for adding essays - accessible from essays.html
window.addNewEssay = function () {
    const modal = document.getElementById('essayModal');
    const modalTitle = document.getElementById('modalTitle');
    const essayIdInput = document.getElementById('essayId');
    const essayForm = document.getElementById('essayForm');

    if (modal && modalTitle && essayIdInput && essayForm) {
        modalTitle.textContent = 'Add New Essay';
        essayIdInput.value = '';
        // Show title and prompt fields for new essay
        document.getElementById('essayTitle').parentElement.style.display = 'block';
        document.getElementById('essayPrompt').parentElement.style.display = 'block';
        modal.style.display = 'block';
    }
};

// Helper to reload essays - used by addNewEssay
window.loadEssays = async function (studentId) {
    try {
        const result = await API.get(`/essays?studentId=${studentId}`);
        if (result.success && result.data) {
            window.renderEssays(result.data);
        }
    } catch (error) {
        console.error('Error loading essays:', error);
        Toast.error('Failed to load essays');
    }
};

window.renderEssays = function (essays) {
    const container = document.querySelector('.content-area .space-y-4');
    if (!container) return;

    if (essays.length === 0) {
        container.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: var(--muted-fg);">No essays yet. Click "Add New Essay" to get started!</p>
            </div>
            <button class="btn btn-primary" onclick="addNewEssay()">+ Add New Essay</button>
        `;
        return;
    }

    container.innerHTML = essays.map(essay => `
        <div class="card">
            <div style="padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem;">
                <h3>${essay.title || 'Untitled Essay'}</h3>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.9rem; color: var(--muted-fg);">
                    Status: ${essay.status || 'draft'}
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${essay.status === 'reviewed' || essay.status === 'final' ?
            '<span class="badge badge-success">Reviewed</span>' :
            '<span class="badge">Draft</span>'}
                    <button class="btn btn-outline" onclick="downloadEssay('${essay.download_url}')">Download</button>
                    <button class="btn btn-outline" onclick="uploadNewVersion('${essay.id}')">Upload New Version</button>
                </div>
            </div>
        </div>
    `).join('') + '<button class="btn btn-primary" onclick="addNewEssay()">+ Add New Essay</button>';
};

window.downloadEssay = function (url) {
    window.open(url, '_blank');
};

window.uploadNewVersion = function (essayId) {
    const modal = document.getElementById('essayModal');
    const modalTitle = document.getElementById('modalTitle');
    const essayIdInput = document.getElementById('essayId');
    const essayForm = document.getElementById('essayForm');

    if (modal && modalTitle && essayIdInput && essayForm) {
        modalTitle.textContent = 'Upload New Version';
        essayIdInput.value = essayId;
        // Hide title and prompt fields for update
        document.getElementById('essayTitle').parentElement.style.display = 'none';
        document.getElementById('essayPrompt').parentElement.style.display = 'none';
        modal.style.display = 'block';
    }
};

window.closeEssayModal = function () {
    const modal = document.getElementById('essayModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('essayForm');
        if (form) form.reset();
    }
};

window.submitEssay = async function () {
    const essayIdInput = document.getElementById('essayId');
    const titleInput = document.getElementById('essayTitle');
    const promptInput = document.getElementById('essayPrompt');
    const fileInput = document.getElementById('essayFile');

    const essayId = essayIdInput.value;
    const title = titleInput.value;
    const prompt = promptInput.value;
    const file = fileInput.files[0];

    if (!file) {
        Toast.error('Please select a file');
        return;
    }

    if (!essayId && !title) {
        Toast.error('Title is required for new essays');
        return;
    }

    try {
        const user = getCurrentUser();
        const studentId = user.student?.id || user.id;

        // Generate unique file path
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const filePath = `essays/${studentId}/${timestamp}-${randomId}.${fileExtension}`;

        // Upload file directly to Supabase storage
        const uploadResult = await SupabaseStorage.uploadFile(file, filePath, {
            contentType: file.type
        });

        // Get signed URL for download
        const signedUrl = await SupabaseStorage.getSignedUrl(filePath);

        let result;
        if (essayId) {
            // Update existing essay
            result = await API.put(`/essays/${essayId}`, {
                title: titleInput.value || undefined,
                prompt: promptInput.value || undefined,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: uploadResult.path,
                signedUrl: signedUrl
            });
        } else {
            // Create new essay
            result = await API.post('/essays', {
                studentId: studentId,
                title: title,
                prompt: prompt || undefined,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: uploadResult.path,
                signedUrl: signedUrl
            });
        }

        if (result.success) {
            Toast.success(essayId ? 'Essay updated successfully!' : 'Essay created successfully!');
            closeEssayModal();
            const user = getCurrentUser();
            await loadEssays(user.student?.id || user.id);
        }
    } catch (error) {
        console.error('Error submitting essay:', error);
        Toast.error(error.message || 'Failed to submit essay');

        // If upload failed, try to clean up the uploaded file
        if (error.uploadedPath) {
            try {
                await SupabaseStorage.deleteFile(error.uploadedPath);
            } catch (cleanupError) {
                console.error('Failed to cleanup uploaded file:', cleanupError);
            }
        }
    }
};

if (window.location.pathname.includes('messages.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        await loadMessages(user.id);
        await loadCounselors();
    });

    async function loadMessages(userId) {
        try {
            const result = await API.get('/messages');
            renderMessages(result.data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            Toast.error('Failed to load messages');
        }
    }

    function renderMessages(messages) {
        const container = document.getElementById('messages-container');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No messages yet</p></div>';
        } else {
            container.innerHTML = messages.map(msg => {
                const sender = msg.sender || {};
                const senderName = sender.full_name || 'Unknown';
                return `
                <div class="card" style="margin-bottom: 1rem; cursor: pointer; ${!msg.is_read ? 'border-left: 4px solid var(--primary);' : ''}" onclick="viewMessage('${msg.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <strong>${senderName}</strong>
                                ${!msg.is_read ? '<span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">NEW</span>' : ''}
                            </div>
                            <div style="font-weight: 500; margin-bottom: 0.5rem;">${msg.subject || 'No Subject'}</div>
                            <div style="font-size: 0.9rem; color: var(--muted-fg); line-height: 1.4;">
                                ${(msg.content || '').substring(0, 100)}${(msg.content || '').length > 100 ? '...' : ''}
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--muted-fg); white-space: nowrap; margin-left: 1rem;">
                            ${new Date(msg.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            `}).join('');
        }
    }

    async function loadCounselors() {
        try {
            const result = await API.get('/counselors');
            if (result.success && result.data) {
                populateRecipientSelect(result.data);
            }
        } catch (error) {
            console.error('Error loading counselors:', error);
            // Fallback to hardcoded if API fails
            populateRecipientSelect([]);
        }
    }

    function populateRecipientSelect(counselors) {
        const select = document.getElementById('recipient');
        if (!select) return;

        // Clear existing options except the first if any
        select.innerHTML = '';

        if (counselors.length > 0) {
            counselors.forEach(counselor => {
                const option = document.createElement('option');
                option.value = counselor.id;
                option.textContent = counselor.full_name || counselor.email;
                select.appendChild(option);
            });
        } else {
            // Fallback
            const option = document.createElement('option');
            option.value = 'counselor-placeholder';
            option.textContent = 'Counselor (Placeholder)';
            select.appendChild(option);
        }
    }
}

// Global functions for messages
window.viewMessage = async function (msgId) {
    try {
        // Mark as read and show message
        await API.patch(`/messages/${msgId}/read`);
        const result = await API.get(`/messages/${msgId}`);

        if (result.success && result.data) {
            const msg = result.data;
            alert(`From: ${msg.sender?.full_name || 'Unknown'}\nSubject: ${msg.subject}\n\n${msg.content}`);

            // Reload messages to update read status
            const user = getCurrentUser();
            if (user) {
                const messagesResult = await API.get('/messages');
                renderMessages(messagesResult.data || []);
            }
        }
    } catch (error) {
        console.error('Error viewing message:', error);
        Toast.error('Failed to load message');
    }
};

window.composeMessage = function () {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'block';
    }
};

// Alias for HTML onclick
window.openMessageModal = window.composeMessage;

window.closeMessageModal = function () {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.sendMessage = async function () {
    const recipientSelect = document.getElementById('recipient');
    const messageSubject = document.getElementById('messageSubject');
    const messageText = document.getElementById('messageText');

    if (!recipientSelect || !messageSubject || !messageText) {
        Toast.error('Form elements not found');
        return;
    }

    const recipientId = recipientSelect.value;
    const subject = messageSubject.value;
    const content = messageText.value;

    if (!recipientId || !content) {
        Toast.error('Please fill in all required fields');
        return;
    }

    try {
        const result = await API.post('/messages', {
            recipientId: recipientId,
            subject: subject || 'No Subject',
            content: content
        });

        if (result.success) {
            Toast.success('Message sent successfully!');
            closeMessageModal();
            messageSubject.value = '';
            messageText.value = '';

            // Reload messages
            const user = getCurrentUser();
            if (user) {
                const messagesResult = await API.get('/messages');
                renderMessages(messagesResult.data || []);
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        Toast.error(error.message || 'Failed to send message');
    }
};

// Helper to render messages - used by window functions
function renderMessages(messages) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No messages yet</p></div>';
    } else {
        container.innerHTML = messages.map(msg => {
            const sender = msg.sender || {};
            const senderName = sender.full_name || 'Unknown';
            return `
            <div class="card" style="margin-bottom: 1rem; cursor: pointer; ${!msg.is_read ? 'border-left: 4px solid var(--primary);' : ''}" onclick="viewMessage('${msg.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <strong>${senderName}</strong>
                            ${!msg.is_read ? '<span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">NEW</span>' : ''}
                        </div>
                        <div style="font-weight: 500; margin-bottom: 0.5rem;">${msg.subject || 'No Subject'}</div>
                        <div style="font-size: 0.9rem; color: var(--muted-fg); line-height: 1.4;">
                            ${(msg.content || '').substring(0, 100)}${(msg.content || '').length > 100 ? '...' : ''}
                        </div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--muted-fg); white-space: nowrap; margin-left: 1rem;">
                        ${new Date(msg.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `}).join('');
    }
}

if (window.location.pathname.includes('calendar.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name || 'Student';

        await loadCalendarEvents(user.student?.id || user.id);
    });

    async function loadCalendarEvents(studentId) {
        try {
            const result = await API.get(`/calendar?studentId=${studentId}`);
            if (result.success && result.data) {
                renderCalendar(result.data);
            }
        } catch (error) {
            console.error('Error loading calendar events:', error);
            Toast.error('Failed to load calendar events');
        }
    }

    function renderCalendar(events) {
        const eventsContainer = document.querySelector('.space-y-4');
        if (!eventsContainer) return;

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="card" style="padding: 1rem;">
                    <p style="text-align: center; color: var(--muted-fg);">No events scheduled yet.</p>
                </div>
                <button class="btn btn-primary" onclick="addEvent()">+ Add Event</button>
            `;
            return;
        }

        const eventTypeColors = {
            'test': 'badge-error',
            'deadline': 'badge-warning',
            'interview': 'badge-success',
            'meeting': 'badge',
            'reminder': 'badge',
            'other': 'badge'
        };

        eventsContainer.innerHTML = events.map(event => {
            const eventDate = new Date(event.event_date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="card" style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin-bottom: 0.25rem;">${event.title}</h4>
                            <p style="font-size: 0.9rem; color: var(--muted-fg);">${formattedDate}</p>
                            ${event.description ? `<p style="font-size: 0.85rem; margin-top: 0.5rem;">${event.description}</p>` : ''}
                        </div>
                        <span class="badge ${eventTypeColors[event.event_type] || 'badge'}">${event.event_type.toUpperCase()}</span>
                    </div>
                </div>
            `;
        }).join('') + '<button class="btn btn-primary" onclick="addEvent()">+ Add Event</button>';
    }
}

// Global function for adding calendar events - accessible from calendar.html
window.addEvent = async function () {
    const title = prompt('Enter event title:');
    if (!title) return;

    const description = prompt('Enter event description (optional):');
    const eventDate = prompt('Enter event date (YYYY-MM-DD):');

    if (!eventDate) {
        Toast.error('Event date is required');
        return;
    }

    const eventTypeInput = prompt('Enter event type (test/deadline/interview/meeting/reminder/other):');
    const eventType = eventTypeInput?.toLowerCase() || 'other';

    const validTypes = ['deadline', 'test', 'interview', 'meeting', 'reminder', 'other'];
    if (!validTypes.includes(eventType)) {
        Toast.error('Invalid event type. Use: test, deadline, interview, meeting, reminder, or other');
        return;
    }

    try {
        // Match backend schema: title, description (optional), eventType, eventDate
        const result = await API.post('/calendar', {
            title: title,
            description: description || '',
            eventType: eventType,
            eventDate: eventDate
        });

        if (result.success) {
            Toast.success('Event created successfully!');
            const user = getCurrentUser();
            await loadCalendarEvents(user.student?.id || user.id);
        }
    } catch (error) {
        console.error('Error creating event:', error);
        Toast.error(error.message || 'Failed to create event');
    }
};

// Helper to reload calendar events
async function loadCalendarEvents(studentId) {
    try {
        const result = await API.get(`/calendar?studentId=${studentId}`);
        if (result.success && result.data) {
            renderCalendar(result.data);
        }
    } catch (error) {
        console.error('Error loading calendar events:', error);
        Toast.error('Failed to load calendar events');
    }
}

function renderCalendar(events) {
    const eventsContainer = document.querySelector('.space-y-4');
    if (!eventsContainer) return;

    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="card" style="padding: 1rem;">
                <p style="text-align: center; color: var(--muted-fg);">No events scheduled yet.</p>
            </div>
            <button class="btn btn-primary" onclick="addEvent()">+ Add Event</button>
        `;
        return;
    }

    const eventTypeColors = {
        'test': 'badge-error',
        'deadline': 'badge-warning',
        'interview': 'badge-success',
        'meeting': 'badge',
        'reminder': 'badge',
        'other': 'badge'
    };

    eventsContainer.innerHTML = events.map(event => {
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="card" style="padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin-bottom: 0.25rem;">${event.title}</h4>
                        <p style="font-size: 0.9rem; color: var(--muted-fg);">${formattedDate}</p>
                        ${event.description ? `<p style="font-size: 0.85rem; margin-top: 0.5rem;">${event.description}</p>` : ''}
                    </div>
                    <span class="badge ${eventTypeColors[event.event_type] || 'badge'}">${event.event_type.toUpperCase()}</span>
                </div>
            </div>
        `;
    }).join('') + '<button class="btn btn-primary" onclick="addEvent()">+ Add Event</button>';
}

if (window.location.pathname.includes('universities.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        currentUser = user; // Set global currentUser for universities.js

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0] || 'Student';

        await loadUniversities();
    });
}
