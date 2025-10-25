// Signup form validation and handling
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkExistingAccount();
    
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');
    const signupButton = document.getElementById('signupButton');
    const successMessage = document.getElementById('successMessage');

    // Password strength checker
    function checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const strengthFill = strengthBar.querySelector('.strength-fill');
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        strengthBar.className = 'password-strength';
        strengthFill.style.width = '0%';

        if (score < 2) {
            strengthBar.classList.add('strength-weak');
        } else if (score < 4) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    }

    // Real-time password strength checking
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Form validation
    function validateForm() {
        let isValid = true;
        const formData = new FormData(signupForm);
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        document.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
        });

        // Validate first name
        const firstName = formData.get('firstName');
        if (!firstName || firstName.trim().length < 2) {
            showError('firstName', 'First name must be at least 2 characters');
            isValid = false;
        }

        // Validate last name
        const lastName = formData.get('lastName');
        if (!lastName || lastName.trim().length < 2) {
            showError('lastName', 'Last name must be at least 2 characters');
            isValid = false;
        }

        // Validate email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            // Check if email already exists
            const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
            
            if (users[email]) {
                // Email already exists, redirect to login page
                alert('An account with this email already exists. Redirecting you to the login page...');
                window.location.href = 'login.html';
                return false; // Prevent form submission
            }
        }

        // Validate password
        const password = formData.get('password');
        if (!password || password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showError('password', 'Password must contain uppercase, lowercase, and number');
            isValid = false;
        }

        // Validate confirm password
        const confirmPassword = formData.get('confirmPassword');
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Validate account type
        const accountType = formData.get('accountType');
        if (!accountType) {
            showError('accountType', 'Please select an account type');
            isValid = false;
        }

        // Validate terms agreement
        const terms = formData.get('terms');
        if (!terms) {
            showError('terms', 'You must agree to the terms and conditions');
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

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validationResult = validateForm();
        if (validationResult === false) {
            // Validation failed (including duplicate email), stop here
            return;
        }
        
        if (validationResult === true) {
            // Show loading state
            signupButton.disabled = true;
            signupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            
            // Simulate API call
            setTimeout(() => {
                const formData = new FormData(signupForm);
                const userData = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    accountType: formData.get('accountType'),
                    newsletter: formData.get('newsletter') === 'on',
                    signupDate: new Date().toISOString()
                };
                
                // Store user in localStorage (simulate database)
                const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
                users[userData.email] = userData;
                localStorage.setItem('taxmind_users', JSON.stringify(users));
                
                // Auto-login the user
                localStorage.setItem('taxmind_current_user', JSON.stringify(userData));
                localStorage.setItem('taxmind_logged_in', 'true');
                
                // Show success message
                successMessage.style.display = 'block';
                signupForm.style.display = 'none';
                
                // Redirect to subscription page
                setTimeout(() => {
                    window.location.href = 'subscription.html';
                }, 2000);
            }, 2000);
        }
    });

    // Real-time validation
    document.querySelectorAll('input, select').forEach(input => {
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
            }
        });
    });

    // Email validation on blur
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            showError('email', 'Please enter a valid email address');
        } else if (this.value && emailRegex.test(this.value)) {
            // Check if email already exists
            const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
            
            if (users[this.value.trim()]) {
                alert('An account with this email already exists. Redirecting you to the login page...');
                window.location.href = 'login.html';
            }
        }
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        if (this.value && password !== this.value) {
            showError('confirmPassword', 'Passwords do not match');
        } else if (this.value && password === this.value) {
            this.classList.remove('error');
            document.getElementById('confirmPasswordError').style.display = 'none';
        }
    });

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
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Check if email already exists in stored users
    function checkEmailExists(email) {
        const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
        
        if (users[email]) {
            // Email already exists, show message and redirect options
            showEmailExistsMessage(email);
        }
    }

    function showEmailExistsMessage(email) {
        // Hide the signup form
        const signupForm = document.getElementById('signupForm');
        const successMessage = document.getElementById('successMessage');
        
        if (signupForm) {
            signupForm.style.display = 'none';
        }
        
        if (successMessage) {
            successMessage.style.display = 'none';
        }
        
        // Prevent form submission
        if (signupForm) {
            signupForm.removeEventListener('submit', handleFormSubmit);
        }
        
        // Create existing email message
        const existingEmailMessage = document.createElement('div');
        existingEmailMessage.className = 'existing-email-message';
        existingEmailMessage.style.cssText = `
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 3rem;
            text-align: center;
            margin: 2rem 0;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
        `;
        
        existingEmailMessage.innerHTML = `
            <div style="color: #f59e0b; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2 style="color: #92400e; margin-bottom: 1rem; font-size: 1.8rem;">Account Already Exists</h2>
            <p style="color: #92400e; margin-bottom: 1rem; font-size: 1.1rem; line-height: 1.6;">
                An account with the email <strong>${email}</strong> already exists.
            </p>
            <p style="color: #92400e; margin-bottom: 2rem; font-size: 1rem;">
                Please log in with your existing account or use a different email address.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="login.html" style="
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(245, 158, 11, 0.3)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-sign-in-alt"></i>
                    Log In Instead
                </a>
                <button onclick="location.reload()" style="
                    background: transparent;
                    color: #f59e0b;
                    padding: 1rem 2rem;
                    border: 2px solid #f59e0b;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.background='#f59e0b'; this.style.color='white'" 
                   onmouseout="this.style.background='transparent'; this.style.color='#f59e0b'">
                    <i class="fas fa-redo"></i>
                    Use Different Email
                </button>
            </div>
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    If you forgot your password, you can reset it from the login page.
                </p>
            </div>
        `;
        
        // Insert the message after the signup header
        const signupHeader = document.querySelector('.signup-header');
        if (signupHeader) {
            signupHeader.parentNode.insertBefore(existingEmailMessage, signupHeader.nextSibling);
        } else {
            // Fallback: insert at the beginning of the signup card
            const signupCard = document.querySelector('.signup-card');
            if (signupCard) {
                signupCard.insertBefore(existingEmailMessage, signupCard.firstChild);
            }
        }
    }

    // Check if user already has an account
    function checkExistingAccount() {
        const isLoggedIn = localStorage.getItem('taxmind_logged_in');
        const currentUser = localStorage.getItem('taxmind_current_user');
        
        if (isLoggedIn === 'true' && currentUser) {
            // User is already logged in, show message and redirect option
            showExistingAccountMessage();
        }
    }

    function showExistingAccountMessage() {
        // Hide the signup form
        const signupForm = document.getElementById('signupForm');
        const successMessage = document.getElementById('successMessage');
        
        if (signupForm) {
            signupForm.style.display = 'none';
        }
        
        if (successMessage) {
            successMessage.style.display = 'none';
        }
        
        // Create existing account message
        const existingAccountMessage = document.createElement('div');
        existingAccountMessage.className = 'existing-account-message';
        existingAccountMessage.style.cssText = `
            background: #f0f9ff;
            border: 2px solid #2563eb;
            border-radius: 12px;
            padding: 3rem;
            text-align: center;
            margin: 2rem 0;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
        `;
        
        existingAccountMessage.innerHTML = `
            <div style="color: #2563eb; font-size: 4rem; margin-bottom: 1rem;">
                <i class="fas fa-user-check"></i>
            </div>
            <h2 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.8rem;">Account Already Exists</h2>
            <p style="color: #64748b; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6;">
                You already have a TaxMind AI account. Please log in to access your dashboard and continue using our services.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="login.html" style="
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(37, 99, 235, 0.3)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-sign-in-alt"></i>
                    Go to Login
                </a>
                <a href="dashboard.html" style="
                    background: transparent;
                    color: #2563eb;
                    padding: 1rem 2rem;
                    border: 2px solid #2563eb;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#2563eb'; this.style.color='white'" 
                   onmouseout="this.style.background='transparent'; this.style.color='#2563eb'">
                    <i class="fas fa-tachometer-alt"></i>
                    Go to Dashboard
                </a>
            </div>
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(37, 99, 235, 0.1); border-radius: 8px;">
                <p style="margin: 0; color: #1e40af; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    If you're having trouble accessing your account, please contact our support team.
                </p>
            </div>
        `;
        
        // Insert the message after the signup header
        const signupHeader = document.querySelector('.signup-header');
        if (signupHeader) {
            signupHeader.parentNode.insertBefore(existingAccountMessage, signupHeader.nextSibling);
        } else {
            // Fallback: insert at the beginning of the signup card
            const signupCard = document.querySelector('.signup-card');
            if (signupCard) {
                signupCard.insertBefore(existingAccountMessage, signupCard.firstChild);
            }
        }
    }
});
