if (window.location.pathname.includes('profile.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        Toast.info('Profile page loaded');
    });
}

if (window.location.pathname.includes('essays.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        await loadEssays(user.id);
    });

    async function loadEssays(studentId) {
        try {
            let result;
            if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
                result = await MockData.getEssays(studentId);
            } else {
                result = await API.get(Config.ENDPOINTS.ESSAYS.LIST);
            }

            if (result.success) {
                renderEssays(result.data);
            }
        } catch (error) {
            console.error('Error loading essays:', error);
            Toast.error('Failed to load essays');
        }
    }

    function renderEssays(essays) {
        const container = document.querySelector('.content-area');
        if (!container) return;

        let html = '<h2 style="margin-bottom: 1.5rem;">My Essays</h2>';

        if (essays.length === 0) {
            html += '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No essays yet. Start writing!</p></div>';
        } else {
            html += essays.map(essay => `
                <div class="card" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <h3 style="margin-bottom: 0.5rem;">${essay.title}</h3>
                            <div style="font-size: 0.85rem; color: var(--muted-fg);">
                                Version ${essay.version} • Last updated: ${DateHelper.timeAgo(essay.lastUpdated)}
                            </div>
                            <span class="badge ${essay.status === 'reviewed' ? 'badge-success' : 'badge-warning'}" style="margin-top: 0.5rem;">
                                ${essay.status}
                            </span>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-outline" onclick="viewEssay(${essay.id})">View</button>
                            <button class="btn btn-primary" onclick="editEssay(${essay.id})">Edit</button>
                        </div>
                    </div>
                    ${essay.feedback ? `
                        <div style="background: var(--muted); padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                            <strong style="font-size: 0.9rem;">Counselor Feedback:</strong>
                            <p style="font-size: 0.9rem; margin-top: 0.5rem;">${essay.feedback}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        html += '<button class="btn btn-primary" style="margin-top: 1rem;" onclick="createNewEssay()">+ New Essay</button>';
        container.innerHTML = html;
    }

    window.viewEssay = function (essayId) {
        Toast.info('Opening essay viewer...');
    };

    window.editEssay = function (essayId) {
        Toast.info('Opening essay editor...');
    };

    window.createNewEssay = function () {
        Toast.info('Creating new essay...');
    };
}

if (window.location.pathname.includes('messages.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        await loadMessages(user.id);
    });

    async function loadMessages(userId) {
        try {
            let result;
            if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
                result = await MockData.getMessages(userId);
            } else {
                result = await API.get(Config.ENDPOINTS.MESSAGES.LIST);
            }

            if (result.success) {
                renderMessages(result.data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            Toast.error('Failed to load messages');
        }
    }

    function renderMessages(messages) {
        const container = document.querySelector('.content-area');
        if (!container) return;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Messages</h2>
                <button class="btn btn-primary" onclick="composeMessage()">+ New Message</button>
            </div>
        `;

        if (messages.length === 0) {
            html += '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No messages yet</p></div>';
        } else {
            html += messages.map(msg => `
                <div class="card" style="margin-bottom: 1rem; cursor: pointer; ${!msg.read ? 'border-left: 4px solid var(--primary);' : ''}" onclick="viewMessage(${msg.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <strong>${msg.from}</strong>
                                ${!msg.read ? '<span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">NEW</span>' : ''}
                            </div>
                            <div style="font-weight: 500; margin-bottom: 0.5rem;">${msg.subject}</div>
                            <div style="font-size: 0.9rem; color: var(--muted-fg); line-height: 1.4;">
                                ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}
                            </div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--muted-fg); white-space: nowrap; margin-left: 1rem;">
                            ${DateHelper.timeAgo(msg.timestamp)}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = html;
    }

    window.viewMessage = function (msgId) {
        Toast.info('Opening message...');
    };

    window.composeMessage = function () {
        Toast.info('Composing new message...');
    };
}

if (window.location.pathname.includes('calendar.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        await loadCalendarEvents(user.id);
    });

    async function loadCalendarEvents(studentId) {
        try {
            let result;
            if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
                result = await MockData.getCalendarEvents(studentId);
            } else {
                result = await API.get(Config.ENDPOINTS.CALENDAR.LIST);
            }

            if (result.success) {
                renderCalendar(result.data);
            }
        } catch (error) {
            console.error('Error loading calendar:', error);
            Toast.error('Failed to load calendar');
        }
    }

    function renderCalendar(events) {
        const container = document.querySelector('.content-area');
        if (!container) return;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Test Dates & Deadlines</h2>
                <button class="btn btn-primary" onclick="addEvent()">+ Add Event</button>
            </div>
        `;

        const grouped = {
            test: events.filter(e => e.type === 'test'),
            deadline: events.filter(e => e.type === 'deadline'),
            meeting: events.filter(e => e.type === 'meeting')
        };

        const types = [
            { key: 'test', title: 'Tests', icon: '' },
            { key: 'deadline', title: 'Deadlines', icon: '' },
            { key: 'meeting', title: 'Meetings', icon: '' }
        ];

        types.forEach(type => {
            if (grouped[type.key].length > 0) {
                html += `
                    <div class="card" style="margin-bottom: 1.5rem;">
                        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>${type.icon}</span>
                            <span>${type.title}</span>
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            ${grouped[type.key].map(event => `
                                <div style="padding: 1rem; background: var(--muted); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 500; margin-bottom: 0.25rem;">${event.title}</div>
                                        <div style="font-size: 0.85rem; color: var(--muted-fg);">
                                            ${event.location} • ${new Date(event.date).toLocaleDateString()} at ${event.time}
                                        </div>
                                    </div>
                                    <span class="badge ${event.status === 'scheduled' ? 'badge-success' : ''}">${event.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        if (events.length === 0) {
            html += '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No events scheduled</p></div>';
        }

        container.innerHTML = html;
    }

    window.addEvent = function () {
        Toast.info('Adding new event...');
    };
}

if (window.location.pathname.includes('notifications.html')) {
    document.addEventListener('DOMContentLoaded', async function () {
        const user = checkAuth('student');
        if (!user) return;

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];

        await loadNotifications(user.id);
    });

    async function loadNotifications(userId) {
        try {
            let result;
            if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
                result = await MockData.getNotifications(userId);
            } else {
                result = await API.get(Config.ENDPOINTS.NOTIFICATIONS.LIST);
            }

            if (result.success) {
                renderNotifications(result.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            Toast.error('Failed to load notifications');
        }
    }

    function renderNotifications(notifications) {
        const container = document.querySelector('.content-area');
        if (!container) return;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Notifications</h2>
                <button class="btn btn-outline" onclick="markAllRead()">Mark All Read</button>
            </div>
        `;

        if (notifications.length === 0) {
            html += '<div class="card"><p style="text-align: center; color: var(--muted-fg); padding: 2rem;">No notifications</p></div>';
        } else {
            html += notifications.map(notif => `
                <div class="card" style="margin-bottom: 1rem; ${!notif.read ? 'background: rgba(78, 205, 196, 0.05); border-left: 4px solid var(--primary);' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span>${getNotificationIcon(notif.type)}</span>
                                <strong>${notif.title}</strong>
                                ${!notif.read ? '<span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">NEW</span>' : ''}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--muted-fg);">${notif.message}</div>
                            <div style="font-size: 0.85rem; color: var(--muted-fg); margin-top: 0.5rem;">
                                ${DateHelper.timeAgo(notif.timestamp)}
                            </div>
                        </div>
                        ${!notif.read ? `<button class="btn btn-ghost btn-sm" onclick="markRead(${notif.id})">Mark</button>` : ''}
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = html;
    }

    function getNotificationIcon(type) {
        const icons = {
            message: '',
            document: '',
            deadline: '',
            test: '',
            default: ''
        };
        return icons[type] || icons.default;
    }

    window.markRead = async function (notifId) {
        try {
            if (Config.USE_MOCK_DATA && typeof MockData !== 'undefined') {
                await MockData.markNotificationRead(notifId);
            } else {
                await API.post(Config.ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notifId));
            }
            Toast.success('Marked as read');
            const user = getCurrentUser();
            if (user) await loadNotifications(user.id);
        } catch (error) {
            Toast.error('Failed to mark as read');
        }
    };

    window.markAllRead = function () {
        Toast.success('All notifications marked as read');
    };
}
