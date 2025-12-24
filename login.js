// Login form validation and authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const successMessage = document.getElementById('successMessage');
    const generalError = document.getElementById('generalError');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const forgotPasswordBtn = document.getElementById('forgotPassword');

    // Password visibility toggle
    togglePasswordBtn.addEventListener('click', function() {
        const passwordField = passwordInput;
        const icon = this.querySelector('i');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const formData = new FormData(loginForm);
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('error');
        });
        generalError.style.display = 'none';

        // Validate email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        const password = formData.get('password');
        if (!password || password.length < 1) {
            showError('password', 'Please enter your password');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function showGeneralError(message) {
        generalError.querySelector('#generalErrorText').textContent = message;
        generalError.style.display = 'block';
    }

    // Authentication function
    function authenticateUser(email, password) {
        // Get stored users from localStorage
        const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
        
        // Check if user exists
        if (!users[email]) {
            return { success: false, message: 'No account found with this email address' };
        }

        // Check password
        if (users[email].password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        return { success: true, user: users[email] };
    }

    // Create demo user if it doesn't exist
    function createDemoUser() {
        const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
        if (!users['demo@taxmindai.com']) {
            const demoUser = {
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@taxmindai.com',
                password: 'Demo123!',
                accountType: 'individual',
                newsletter: false,
                signupDate: new Date().toISOString()
            };
            users['demo@taxmindai.com'] = demoUser;
            localStorage.setItem('taxmind_users', JSON.stringify(users));
        }
    }

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading state
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            
            // Simulate API call delay
            setTimeout(() => {
                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');
                const rememberMe = formData.get('rememberMe') === 'on';

                // Create demo user if needed
                createDemoUser();

                // Authenticate user
                const authResult = authenticateUser(email, password);

                if (authResult.success) {
                    // Store current user session
                    localStorage.setItem('taxmind_current_user', JSON.stringify(authResult.user));
                    localStorage.setItem('taxmind_logged_in', 'true');
                    
                    // Set remember me cookie if checked (using secure cookie utility)
                    if (rememberMe) {
                        if (typeof SecurityUtils !== 'undefined') {
                            SecurityUtils.setSecureCookie('taxmind_remember', email, 30, { sameSite: 'Strict' });
                        } else {
                            // Fallback for older browsers
                            const expirationDate = new Date();
                            expirationDate.setDate(expirationDate.getDate() + 30);
                            const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
                            document.cookie = `taxmind_remember=${encodeURIComponent(email)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict${isSecure ? '; Secure' : ''}`;
                        }
                    }

                    // Show success message
                    successMessage.style.display = 'block';
                    loginForm.style.display = 'none';
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    // Show error message
                    showGeneralError(authResult.message);
                    
                    // Reset button
                    loginButton.disabled = false;
                    loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                }
            }, 1500);
        }
    });

    // Auto-fill demo credentials when clicking on demo credentials
    document.querySelector('.demo-credentials').addEventListener('click', function() {
        emailInput.value = 'demo@taxmindai.com';
        passwordInput.value = 'Demo123!';
        
        // Remove any error states
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
        document.getElementById('emailError').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';
        generalError.style.display = 'none';
    });

    // Forgot password functionality
    forgotPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        if (!email) {
            showGeneralError('Please enter your email address first');
            return;
        }

        // Check if user exists
        const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
        if (!users[email]) {
            showGeneralError('No account found with this email address');
            return;
        }

        // Simulate password reset
        alert(`Password reset instructions have been sent to ${email}. Check your email for further instructions.`);
    });

    // Real-time validation
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });

        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('error');
                const errorElement = document.getElementById(this.name + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
                generalError.style.display = 'none';
            }
        });
    });

    // Email validation on blur
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            showError('email', 'Please enter a valid email address');
        }
    });

    // Check for remember me cookie on page load
    function checkRememberMe() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'taxmind_remember') {
                emailInput.value = decodeURIComponent(value);
                document.getElementById('rememberMe').checked = true;
                break;
            }
        }
    }

    // Initialize remember me check
    checkRememberMe();

    // Mobile menu toggle (reuse from main script)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation to social buttons
    document.querySelectorAll('.social-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
                alert('This would connect to the respective social login service.');
            }, 1500);
        });
    });

    // Add focus effects to form elements
    document.querySelectorAll('input').forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Check if user is already logged in
    function checkExistingLogin() {
        const isLoggedIn = localStorage.getItem('taxmind_logged_in');
        const currentUser = localStorage.getItem('taxmind_current_user');
        
        if (isLoggedIn === 'true' && currentUser) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    // Initialize login check
    checkExistingLogin();
});