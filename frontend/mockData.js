const MockData = {
    currentUser: null,
    users: {
        students: [
            {
                id: 1,
                name: 'Aisha Khan',
                email: 'aisha@example.com',
                password: 'password123',
                role: 'student',
                country: 'Pakistan',
                phone: '+92-300-1234567',
                counselorId: 1,
                profileComplete: 60,
                createdAt: '2024-09-15T10:00:00Z'
            },
            {
                id: 2,
                name: 'Omar Ahmed',
                email: 'omar@example.com',
                password: 'password123',
                role: 'student',
                country: 'Saudi Arabia',
                phone: '+966-50-1234567',
                counselorId: 2,
                profileComplete: 100,
                createdAt: '2024-08-20T10:00:00Z'
            },
            {
                id: 3,
                name: 'Sara Ali',
                email: 'sara@example.com',
                password: 'password123',
                role: 'student',
                country: 'Pakistan',
                phone: '+92-300-7654321',
                counselorId: 1,
                profileComplete: 85,
                createdAt: '2024-10-01T10:00:00Z'
            }
        ],
        schools: [
            {
                id: 1,
                name: 'Karachi Grammar School',
                email: 'admin@kgs.edu.pk',
                password: 'school123',
                role: 'school',
                country: 'Pakistan',
                studentCount: 64,
                createdAt: '2024-06-01T10:00:00Z'
            }
        ],
        admins: [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@educounsel.com',
                password: 'admin123',
                role: 'admin',
                createdAt: '2024-01-01T10:00:00Z'
            }
        ]
    },
    counselors: [
        {
            id: 1,
            name: 'Ms. Khan',
            email: 'khan@educounsel.com',
            specialization: 'US Universities',
            responseTime: '2h',
            studentCount: 45,
            rating: 4.8
        },
        {
            id: 2,
            name: 'Mr. Ali',
            email: 'ali@educounsel.com',
            specialization: 'UK Universities',
            responseTime: '3h',
            studentCount: 38,
            rating: 4.7
        },
        {
            id: 3,
            name: 'Dr. Ahmed',
            email: 'ahmed@educounsel.com',
            specialization: 'Canadian Universities',
            responseTime: '4h',
            studentCount: 32,
            rating: 4.9
        }
    ],
    universities: [
        {
            id: 1,
            name: 'Harvard University',
            country: 'USA',
            ranking: 1,
            applicationDeadline: '2025-01-01',
            acceptanceRate: 3.2,
            tuitionFee: 54000,
            imageUrl: null
        },
        {
            id: 2,
            name: 'Stanford University',
            country: 'USA',
            ranking: 2,
            applicationDeadline: '2025-01-05',
            acceptanceRate: 3.9,
            tuitionFee: 56000,
            imageUrl: null
        },
        {
            id: 3,
            name: 'MIT',
            country: 'USA',
            ranking: 3,
            applicationDeadline: '2025-01-01',
            acceptanceRate: 4.1,
            tuitionFee: 55000,
            imageUrl: null
        },
        {
            id: 4,
            name: 'Oxford University',
            country: 'UK',
            ranking: 4,
            applicationDeadline: '2025-01-15',
            acceptanceRate: 17.5,
            tuitionFee: 35000,
            imageUrl: null
        }
    ],
    applications: [
        { id: 1, studentId: 1, universityId: 1, status: 'in-progress', progress: 45, createdAt: '2024-10-01T10:00:00Z' },
        { id: 2, studentId: 1, universityId: 2, status: 'applied', progress: 100, createdAt: '2024-09-15T10:00:00Z' },
        { id: 3, studentId: 1, universityId: 4, status: 'accepted', progress: 100, createdAt: '2024-09-01T10:00:00Z' },
        { id: 4, studentId: 2, universityId: 1, status: 'accepted', progress: 100, createdAt: '2024-08-20T10:00:00Z' },
        { id: 5, studentId: 3, universityId: 3, status: 'in-progress', progress: 60, createdAt: '2024-10-10T10:00:00Z' }
    ],
    documents: [
        { id: 1, studentId: 1, name: 'Transcript.pdf', type: 'transcript', status: 'approved', uploadedAt: '2024-10-15T10:00:00Z', size: 245000 },
        { id: 2, studentId: 1, name: 'Passport.pdf', type: 'passport', status: 'pending', uploadedAt: '2024-10-18T10:00:00Z', size: 180000 },
        { id: 3, studentId: 1, name: 'SAT_Score.pdf', type: 'test-score', status: 'approved', uploadedAt: '2024-10-12T10:00:00Z', size: 120000 },
        { id: 4, studentId: 1, name: 'Recommendation_Letter.pdf', type: 'recommendation', status: 'approved', uploadedAt: '2024-10-10T10:00:00Z', size: 300000 },
        { id: 5, studentId: 1, name: 'Essay_Draft.pdf', type: 'essay', status: 'pending', uploadedAt: '2024-10-20T10:00:00Z', size: 95000 },
        { id: 6, studentId: 1, name: 'Financial_Statement.pdf', type: 'financial', status: 'rejected', uploadedAt: '2024-10-08T10:00:00Z', size: 210000 }
    ],
    essays: [
        {
            id: 1,
            studentId: 1,
            title: 'Common App Essay',
            content: 'Tell us your story...',
            version: 2,
            status: 'reviewed',
            feedback: 'Great start! Consider expanding the conclusion.',
            lastUpdated: '2024-10-18T10:00:00Z'
        },
        {
            id: 2,
            studentId: 1,
            title: 'Why Harvard?',
            content: 'I want to attend Harvard because...',
            version: 1,
            status: 'draft',
            feedback: null,
            lastUpdated: '2024-10-20T10:00:00Z'
        }
    ],
    calendarEvents: [
        { id: 1, studentId: 1, title: 'SAT Exam', type: 'test', date: '2025-11-05', time: '09:00', location: 'Testing Center A', status: 'scheduled' },
        { id: 2, studentId: 1, title: 'IELTS Exam', type: 'test', date: '2025-11-20', time: '14:00', location: 'British Council', status: 'scheduled' },
        { id: 3, studentId: 1, title: 'Harvard Application Deadline', type: 'deadline', date: '2025-01-01', time: '23:59', location: 'Online', status: 'upcoming' },
        { id: 4, studentId: 1, title: 'Counselor Meeting', type: 'meeting', date: '2024-10-28', time: '15:00', location: 'Video Call', status: 'upcoming' }
    ],
    messages: [
        {
            id: 1,
            from: 'Ms. Khan',
            fromId: 1,
            to: 'Student',
            toId: 1,
            subject: 'Essay Review Complete',
            message: 'I have reviewed your Common App essay. Please check the feedback.',
            timestamp: '2024-10-20T14:30:00Z',
            read: false
        },
        {
            id: 2,
            from: 'Mr. Ali',
            fromId: 2,
            to: 'Student',
            toId: 1,
            subject: 'Document Approval',
            message: 'Your transcript has been approved.',
            timestamp: '2024-10-19T10:15:00Z',
            read: true
        },
        {
            id: 3,
            from: 'Student',
            fromId: 1,
            to: 'Ms. Khan',
            toId: 1,
            subject: 'Question about Harvard',
            message: 'Can you help me with the supplemental essays?',
            timestamp: '2024-10-18T16:45:00Z',
            read: true
        }
    ],
    notifications: [
        { id: 1, studentId: 1, title: 'New Message', message: 'You have a new message from Ms. Khan', type: 'message', read: false, timestamp: '2024-10-20T14:30:00Z' },
        { id: 2, studentId: 1, title: 'Document Approved', message: 'Your transcript has been approved', type: 'document', read: false, timestamp: '2024-10-19T10:15:00Z' },
        { id: 3, studentId: 1, title: 'Upcoming Deadline', message: 'Harvard application deadline in 72 days', type: 'deadline', read: true, timestamp: '2024-10-18T09:00:00Z' },
        { id: 4, studentId: 1, title: 'Test Reminder', message: 'SAT exam in 15 days', type: 'test', read: true, timestamp: '2024-10-17T09:00:00Z' }
    ],
    stats: {
        student: {
            documentsUploaded: 6,
            documentsTotal: 10,
            essaysDrafted: 2,
            essaysReviewed: 1,
            testsScheduled: 2,
            applicationsInProgress: 3,
            applicationsCompleted: 1,
            progressTracking: {
                documents: 60,
                essays: 40,
                testPrep: 80,
                applications: 30
            }
        },
        school: {
            totalStudents: 64,
            acceptances: 22,
            topUniversities: 8,
            pendingMessages: 12
        },
        admin: {
            totalStudents: 312,
            newSignups7d: 74,
            activeCounselors: 8,
            activeSchools: 5,
            weeklySignups: [10, 15, 8, 12, 11, 9, 9]
        }
    },
    delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),
    async login(email, password, role) {
        await this.delay();
        let user = null;
        if (role === 'student') {
            user = this.users.students.find(u => u.email === email && u.password === password);
        } else if (role === 'school') {
            user = this.users.schools.find(u => u.email === email && u.password === password);
        } else if (role === 'admin') {
            user = this.users.admins.find(u => u.email === email && u.password === password);
        }
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password;
            return {
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: this.currentUser
            };
        }
        return {
            success: false,
            error: 'Invalid email or password'
        };
    },
    async signup(data) {
        await this.delay();
        const newUser = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };
        if (data.role === 'student') {
            delete newUser.password;
            this.users.students.push(newUser);
        } else if (data.role === 'school') {
            delete newUser.password;
            this.users.schools.push(newUser);
        }
        this.currentUser = newUser;
        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: newUser
        };
    },
    async getStudentProfile(studentId) {
        await this.delay();
        const student = this.users.students.find(s => s.id === studentId);
        if (!student) return { success: false, error: 'Student not found' };
        const counselor = this.counselors.find(c => c.id === student.counselorId);
        return {
            success: true,
            data: {
                ...student,
                counselor: counselor
            }
        };
    },
    async getStudentStats(studentId) {
        await this.delay();
        return {
            success: true,
            data: this.stats.student
        };
    },
    async getDocuments(studentId) {
        await this.delay();
        const docs = this.documents.filter(d => d.studentId === studentId);
        return {
            success: true,
            data: docs
        };
    },
    async uploadDocument(studentId, file) {
        await this.delay(1000);
        const newDoc = {
            id: Date.now(),
            studentId: studentId,
            name: file.name,
            type: file.type,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            size: file.size
        };
        this.documents.push(newDoc);
        return {
            success: true,
            data: newDoc
        };
    },
    async deleteDocument(docId) {
        await this.delay();
        const index = this.documents.findIndex(d => d.id === docId);
        if (index > -1) {
            this.documents.splice(index, 1);
            return { success: true };
        }
        return { success: false, error: 'Document not found' };
    },
    async getEssays(studentId) {
        await this.delay();
        const essays = this.essays.filter(e => e.studentId === studentId);
        return {
            success: true,
            data: essays
        };
    },
    async saveEssay(studentId, essayData) {
        await this.delay();
        const existingEssay = this.essays.find(e => e.id === essayData.id);
        if (existingEssay) {
            Object.assign(existingEssay, {
                ...essayData,
                version: existingEssay.version + 1,
                lastUpdated: new Date().toISOString()
            });
            return { success: true, data: existingEssay };
        } else {
            const newEssay = {
                id: Date.now(),
                studentId: studentId,
                ...essayData,
                version: 1,
                status: 'draft',
                feedback: null,
                lastUpdated: new Date().toISOString()
            };
            this.essays.push(newEssay);
            return { success: true, data: newEssay };
        }
    },
    async getUniversities(studentId) {
        await this.delay();
        const studentApps = this.applications.filter(a => a.studentId === studentId);
        const universities = studentApps.map(app => {
            const uni = this.universities.find(u => u.id === app.universityId);
            return { ...uni, applicationStatus: app.status, progress: app.progress };
        });
        return {
            success: true,
            data: universities
        };
    },
    async searchUniversities(query) {
        await this.delay();
        const results = this.universities.filter(u =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.country.toLowerCase().includes(query.toLowerCase())
        );
        return {
            success: true,
            data: results
        };
    },
    async getCalendarEvents(studentId) {
        await this.delay();
        const events = this.calendarEvents.filter(e => e.studentId === studentId);
        return {
            success: true,
            data: events
        };
    },
    async getMessages(userId) {
        await this.delay();
        const msgs = this.messages.filter(m => m.toId === userId || m.fromId === userId);
        return {
            success: true,
            data: msgs
        };
    },
    async sendMessage(messageData) {
        await this.delay();
        const newMessage = {
            id: Date.now(),
            ...messageData,
            timestamp: new Date().toISOString(),
            read: false
        };
        this.messages.push(newMessage);
        return {
            success: true,
            data: newMessage
        };
    },
    async getNotifications(userId) {
        await this.delay();
        const notifs = this.notifications.filter(n => n.studentId === userId);
        return {
            success: true,
            data: notifs
        };
    },
    async markNotificationRead(notifId) {
        await this.delay();
        const notif = this.notifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
            return { success: true };
        }
        return { success: false, error: 'Notification not found' };
    },
    async getAdminStats() {
        await this.delay();
        return {
            success: true,
            data: this.stats.admin
        };
    },
    async getAllStudents() {
        await this.delay();
        const students = this.users.students.map(s => {
            const counselor = this.counselors.find(c => c.id === s.counselorId);
            return { ...s, counselor: counselor?.name };
        });
        return {
            success: true,
            data: students
        };
    },
    async assignCounselor(studentId, counselorId) {
        await this.delay();
        const student = this.users.students.find(s => s.id === studentId);
        if (student) {
            student.counselorId = counselorId;
            return { success: true };
        }
        return { success: false, error: 'Student not found' };
    },
    async getSchoolStats(schoolId) {
        await this.delay();
        return {
            success: true,
            data: this.stats.school
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockData;
}
