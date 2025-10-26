document.addEventListener('DOMContentLoaded', function () {
    initAuthForms();
});

function initAuthForms() {
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', handleStudentLogin);
    }

    const schoolLoginForm = document.getElementById('school-login-form');
    if (schoolLoginForm) {
        schoolLoginForm.addEventListener('submit', handleSchoolLogin);
    }

    const studentSignupForm = document.getElementById('student-signup-form');
    if (studentSignupForm) {
        studentSignupForm.addEventListener('submit', handleStudentSignup);
    }

    const schoolSignupForm = document.getElementById('school-signup-form');
    if (schoolSignupForm) {
        schoolSignupForm.addEventListener('submit', handleSchoolSignup);
    }
}

async function handleStudentLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email-student').value;
    const password = document.getElementById('pass-student').value;

    if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    if (!Validator.required(password)) {
        Toast.error('Please enter your password');
        return;
    }

    try {
        const result = await API.post(Config.ENDPOINTS.AUTH.LOGIN, {
            email,
            password
        });

        if (result.success && result.data && result.data.accessToken) {
            API.setAuthToken(result.data.accessToken);
            if (result.data.refreshToken) {
                API.setRefreshToken(result.data.refreshToken);
            }
            Storage.set(Config.STORAGE_KEYS.USER_DATA, result.data.user);
            Storage.set(Config.STORAGE_KEYS.USER_ROLE, result.data.user.role);

            Toast.success('Login successful! Redirecting...');

            setTimeout(() => {
                if (result.data.user.role === 'student') {
                    window.location.href = 'student/dashboard.html';
                } else if (result.data.user.role === 'counselor' || result.data.user.role === 'school') {
                    window.location.href = 'school/dashboard.html';
                } else if (result.data.user.role === 'admin') {
                    window.location.href = 'admin/dashboard.html';
                }
            }, 1000);
        } else {
            Toast.error('Login failed. Please check your credentials and try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.message || 'Invalid email or password. Please try again.';
        Toast.error(errorMessage);
    }
}

async function handleSchoolLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email-school').value;
    const password = document.getElementById('pass-school').value;

    if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    if (!Validator.required(password)) {
        Toast.error('Please enter your password');
        return;
    }

    try {
        const result = await API.post(Config.ENDPOINTS.AUTH.LOGIN, {
            email,
            password
        });

        if (result.success && result.data && result.data.accessToken) {
            API.setAuthToken(result.data.accessToken);
            if (result.data.refreshToken) {
                API.setRefreshToken(result.data.refreshToken);
            }
            Storage.set(Config.STORAGE_KEYS.USER_DATA, result.data.user);
            Storage.set(Config.STORAGE_KEYS.USER_ROLE, result.data.user.role);

            Toast.success('Login successful! Redirecting...');

            setTimeout(() => {
                if (result.data.user.role === 'student') {
                    window.location.href = '../student/dashboard.html';
                } else if (result.data.user.role === 'counselor' || result.data.user.role === 'school') {
                    window.location.href = '../school/dashboard.html';
                } else if (result.data.user.role === 'admin') {
                    window.location.href = '../admin/dashboard.html';
                }
            }, 1000);
        } else {
            Toast.error('Login failed. Please check your credentials and try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.message || 'Invalid email or password. Please try again.';
        Toast.error(errorMessage);
    }
}

async function handleStudentSignup(e) {
    e.preventDefault();

    const name = document.getElementById('name-student').value;
    const email = document.getElementById('email-student').value;
    const password = document.getElementById('pass-student').value;

    if (!Validator.required(name)) {
        Toast.error('Please enter your name');
        return;
    }

    if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    if (!Validator.minLength(password, 6)) {
        Toast.error('Password must be at least 6 characters');
        return;
    }

    try {
        const result = await API.post(Config.ENDPOINTS.AUTH.SIGNUP, {
            fullName: name,
            email,
            password,
            role: 'student'
        });

        if (result.success && result.data && result.data.accessToken) {
            API.setAuthToken(result.data.accessToken);
            if (result.data.refreshToken) {
                API.setRefreshToken(result.data.refreshToken);
            }
            Storage.set(Config.STORAGE_KEYS.USER_DATA, result.data.user);
            Storage.set(Config.STORAGE_KEYS.USER_ROLE, result.data.user.role);

            Toast.success('Account created successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = 'student/dashboard.html';
            }, 1000);
        } else {
            Toast.error('Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        const errorMessage = error.message || 'Failed to create account. Please try again.';
        Toast.error(errorMessage);
    }
}

async function handleSchoolSignup(e) {
    e.preventDefault();

    const name = document.getElementById('school-name').value;
    const email = document.getElementById('email-school').value;
    const password = document.getElementById('pass-school').value;

    if (!Validator.required(name)) {
        Toast.error('Please enter school name');
        return;
    }

    if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    if (!Validator.minLength(password, 6)) {
        Toast.error('Password must be at least 6 characters');
        return;
    }

    try {
        const result = await API.post(Config.ENDPOINTS.AUTH.SIGNUP, {
            fullName: name,
            email,
            password,
            role: 'counselor'
        });

        if (result.success && result.data && result.data.accessToken) {
            API.setAuthToken(result.data.accessToken);
            if (result.data.refreshToken) {
                API.setRefreshToken(result.data.refreshToken);
            }
            Storage.set(Config.STORAGE_KEYS.USER_DATA, result.data.user);
            Storage.set(Config.STORAGE_KEYS.USER_ROLE, result.data.user.role);

            Toast.success('Account created successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = 'school/dashboard.html';
            }, 1000);
        } else {
            Toast.error('Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        const errorMessage = error.message || 'Failed to create account. Please try again.';
        Toast.error(errorMessage);
    }
}

function logout() {
    API.clearTokens();
    Storage.clear();
    Toast.success('Logged out successfully');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

function checkAuth(requiredRole = null) {
    const token = Storage.get(Config.STORAGE_KEYS.AUTH_TOKEN);
    const userData = Storage.get(Config.STORAGE_KEYS.USER_DATA);
    const userRole = Storage.get(Config.STORAGE_KEYS.USER_ROLE);

    if (!token || !userData) {
        Toast.error('Please login to continue');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);
        return false;
    }

    if (requiredRole && userRole !== requiredRole) {
        Toast.error('Access denied');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
        return false;
    }

    return userData;
}

function getCurrentUser() {
    return Storage.get(Config.STORAGE_KEYS.USER_DATA);
}
