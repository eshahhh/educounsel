document.addEventListener('DOMContentLoaded', function () {
    initAccordion();
    initTabs();
    initNavigation();
});

function initAccordion() {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const item = this.parentElement;
            const wasActive = item.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

function initTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            document.querySelectorAll('.tab-trigger').forEach(t => {
                t.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active');
            });

            this.classList.add('active');
            const content = document.getElementById(tabId);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

function initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

const Storage = {
    set: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    get: function (key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },

    remove: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    clear: function () {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
};

const API = {
    baseURL: Config.API_BASE_URL,
    timeout: Config.REQUEST_TIMEOUT,
    endpoints: Config.ENDPOINTS,

    getAuthToken: function () {
        return Storage.get(Config.STORAGE_KEYS.AUTH_TOKEN);
    },

    getRefreshToken: function () {
        return Storage.get(Config.STORAGE_KEYS.REFRESH_TOKEN);
    },

    setAuthToken: function (token) {
        Storage.set(Config.STORAGE_KEYS.AUTH_TOKEN, token);
    },

    setRefreshToken: function (token) {
        Storage.set(Config.STORAGE_KEYS.REFRESH_TOKEN, token);
    },

    clearTokens: function () {
        Storage.remove(Config.STORAGE_KEYS.AUTH_TOKEN);
        Storage.remove(Config.STORAGE_KEYS.REFRESH_TOKEN);
    },

    request: async function (endpoint, options = {}) {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401 && !options.skipAuth) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    return this.request(endpoint, options);
                } else {
                    this.clearTokens();
                    Storage.remove(Config.STORAGE_KEYS.USER_DATA);
                    window.location.href = '/login.html';
                    throw new Error('Session expired. Please login again.');
                }
            }

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    refreshAccessToken: async function () {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await this.request(this.endpoints.AUTH.REFRESH, {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
                skipAuth: true
            });

            if (response.accessToken) {
                this.setAuthToken(response.accessToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    },

    get: function (endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post: function (endpoint, data) {
        const options = {
            method: 'POST'
        };

        if (data instanceof FormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    },

    put: function (endpoint, data) {
        const options = {
            method: 'PUT'
        };

        if (data instanceof FormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    },

    patch: function (endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    delete: function (endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

const Validator = {
    email: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    required: function (value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    minLength: function (value, length) {
        return value && value.toString().length >= length;
    },

    maxLength: function (value, length) {
        return value && value.toString().length <= length;
    },

    phone: function (phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
};

const Toast = {
    show: function (message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#96ceb4' : type === 'error' ? '#ff6b6b' : '#4ecdc4'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    },

    success: function (message) {
        this.show(message, 'success');
    },

    error: function (message) {
        this.show(message, 'error');
    },

    info: function (message) {
        this.show(message, 'info');
    }
};

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const DateHelper = {
    format: function (date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    timeAgo: function (date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';

        return Math.floor(seconds) + ' seconds ago';
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, API, Validator, Toast, DateHelper };
}
