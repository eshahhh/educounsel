const Config = {
    API_BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        STUDENTS: {
            LIST: '/students',
            GET: '/students/:id',
            CREATE: '/students',
            UPDATE: '/students/:id',
            DELETE: '/students/:id',
            PROFILE: '/students/:id/profile',
            DOCUMENTS: '/students/:id/documents',
            ESSAYS: '/students/:id/essays',
            UNIVERSITIES: '/students/:id/universities',
            CALENDAR: '/students/:id/calendar',
            PROGRESS: '/students/:id/progress',
            STATS: '/students/:id/stats'
        },
        UNIVERSITIES: {
            LIST: '/universities',
            GET: '/universities/:id',
            SEARCH: '/universities/search',
            SHORTLIST: '/universities/shortlist'
        },
        DOCUMENTS: {
            LIST: '/documents',
            GET: '/documents/:id',
            UPLOAD: '/documents/upload',
            UPDATE: '/documents/:id',
            DELETE: '/documents/:id',
            DOWNLOAD: '/documents/:id/download'
        },
        ESSAYS: {
            LIST: '/essays',
            GET: '/essays/:id',
            CREATE: '/essays',
            UPDATE: '/essays/:id',
            DELETE: '/essays/:id',
            VERSIONS: '/essays/:id/versions',
            FEEDBACK: '/essays/:id/feedback'
        },
        MESSAGES: {
            LIST: '/messages',
            GET: '/messages/:id',
            SEND: '/messages',
            CONVERSATIONS: '/messages/conversations',
            MARK_READ: '/messages/:id/read'
        },
        NOTIFICATIONS: {
            LIST: '/notifications',
            GET: '/notifications/:id',
            MARK_READ: '/notifications/:id/read',
            MARK_ALL_READ: '/notifications/mark-all-read',
            DELETE: '/notifications/:id'
        },
        CALENDAR: {
            LIST: '/calendar',
            GET: '/calendar/:id',
            CREATE: '/calendar',
            UPDATE: '/calendar/:id',
            DELETE: '/calendar/:id'
        },
        SCHOOLS: {
            LIST: '/schools',
            GET: '/schools/:id',
            STATS: '/schools/:id/stats',
            STUDENTS: '/schools/:id/students'
        },
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            STUDENTS: '/admin/students',
            COUNSELORS: '/admin/counselors',
            SCHOOLS: '/admin/schools',
            REPORTS: '/admin/reports',
            ASSIGN_COUNSELOR: '/admin/assign-counselor'
        },
        COUNSELORS: {
            LIST: '/counselors',
            GET: '/counselors/:id',
            STUDENTS: '/counselors/:id/students'
        }
    },
    REQUEST_TIMEOUT: 30000,
    USE_MOCK_DATA: true,
    STORAGE_KEYS: {
        AUTH_TOKEN: 'educounsel_auth_token',
        USER_DATA: 'educounsel_user_data',
        USER_ROLE: 'educounsel_user_role',
        REMEMBER_ME: 'educounsel_remember_me'
    },
    APP: {
        NAME: 'EduCounsel',
        VERSION: '1.0.0',
        SESSION_TIMEOUT: 3600000,
        MAX_FILE_SIZE: 10485760,
        ALLOWED_FILE_TYPES: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
