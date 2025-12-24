// OAuth Handler for Google and Microsoft Sign-In/Sign-Up
// Production-ready implementation with demo mode and comprehensive error handling

// ============================================================================
// CONFIGURATION - Update these with your OAuth credentials
// ============================================================================
const OAUTH_CONFIG = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your Google Client ID
        // Get from: https://console.cloud.google.com/apis/credentials
    },
    microsoft: {
        clientId: 'YOUR_MICROSOFT_CLIENT_ID', // Replace with your Microsoft Application (client) ID
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin,
        // Get from: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
    },
    // Auto-fill form instead of auto-creating account
    autofillForm: true, // If true, fills signup form. If false, auto-creates account.
    // Demo mode - enables smooth OAuth simulation for testing
    demoMode: true, // Set to false when you have real OAuth credentials
    demoDelay: 1500 // Simulated authentication delay in ms
};

// ============================================================================
// DEMO MODE - Simulates OAuth for testing without credentials
// ============================================================================
function simulateOAuthAuth(provider) {
    return new Promise((resolve) => {
        // Show loading state
        const buttons = document.querySelectorAll(`#${provider}SignupBtn, #${provider}LoginBtn`);
        buttons.forEach(btn => {
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                }, OAUTH_CONFIG.demoDelay);
            }
        });

        setTimeout(() => {
            // Generate demo user data
            const demoUsers = {
                google: {
                    email: 'demo.google@taxmindai.com',
                    firstName: 'Google',
                    lastName: 'User',
                    name: 'Google Demo User',
                    picture: 'https://via.placeholder.com/150',
                    provider: 'google',
                    providerId: 'demo-google-' + Date.now(),
                },
                microsoft: {
                    email: 'demo.microsoft@taxmindai.com',
                    firstName: 'Microsoft',
                    lastName: 'User',
                    name: 'Microsoft Demo User',
                    picture: null,
                    provider: 'microsoft',
                    providerId: 'demo-microsoft-' + Date.now(),
                }
            };

            const userData = {
                ...demoUsers[provider],
                signupDate: new Date().toISOString(),
                accountType: 'individual'
            };

            resolve(userData);
        }, OAUTH_CONFIG.demoDelay);
    });
}

// ============================================================================
// GOOGLE OAUTH IMPLEMENTATION
// ============================================================================
function initGoogleSignIn() {
    if (OAUTH_CONFIG.demoMode || !OAUTH_CONFIG.google.clientId || OAUTH_CONFIG.google.clientId.includes('YOUR_GOOGLE')) {
        console.log('Google OAuth: Demo mode active or credentials not configured');
        return;
    }

    if (typeof google === 'undefined' || !google.accounts) {
        console.warn('Google Identity Services not loaded');
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: OAUTH_CONFIG.google.clientId,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        console.log('Google OAuth initialized successfully');
    } catch (error) {
        console.error('Error initializing Google OAuth:', error);
    }
}

function handleGoogleSignIn(response) {
    if (!response.credential) {
        console.error('No credential in Google response');
        return;
    }

    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userData = {
            email: payload.email,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            name: payload.name || '',
            picture: payload.picture || '',
            provider: 'google',
            providerId: payload.sub,
            signupDate: new Date().toISOString(),
            accountType: 'individual'
        };

        processOAuthUser(userData, 'google');
    } catch (error) {
        console.error('Error processing Google sign-in:', error);
        showOAuthError('Error processing Google authentication. Please try again.');
    }
}

async function handleGoogleSignInButton() {
    // Check if demo mode is enabled
    if (OAUTH_CONFIG.demoMode) {
        console.log('Google Sign-In: Using demo mode');
        try {
            const userData = await simulateOAuthAuth('google');
            processOAuthUser(userData, 'google');
        } catch (error) {
            console.error('Demo OAuth error:', error);
            showOAuthError('Error with demo authentication. Please try again.');
        }
        return;
    }
    
    // Check if credentials are configured
    const hasGoogleCredentials = OAUTH_CONFIG.google.clientId && 
                                 !OAUTH_CONFIG.google.clientId.includes('YOUR_GOOGLE');
    
    if (!hasGoogleCredentials) {
        // Fallback to demo mode if credentials not configured
        console.log('Google OAuth not configured, using demo mode');
        try {
            const userData = await simulateOAuthAuth('google');
            processOAuthUser(userData, 'google');
        } catch (error) {
            showOAuthError('Google Sign-In is not configured. Please set up OAuth credentials. See OAUTH_SETUP.md for instructions.');
        }
        return;
    }

    if (typeof google === 'undefined' || !google.accounts) {
        showOAuthError('Google Sign-In is not available. Please check your configuration or enable demo mode.');
        return;
    }

    try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: OAUTH_CONFIG.google.clientId,
            scope: 'email profile',
            callback: async (response) => {
                if (response.error) {
                    console.error('Google OAuth error:', response.error);
                    if (response.error !== 'popup_closed_by_user') {
                        showOAuthError('Error signing in with Google: ' + response.error);
                    }
                    return;
                }

                if (response.access_token) {
                    try {
                        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: {
                                'Authorization': `Bearer ${response.access_token}`
                            }
                        });

                        if (!profileResponse.ok) {
                            throw new Error('Failed to fetch user profile');
                        }

                        const profile = await profileResponse.json();
                        const userData = {
                            email: profile.email,
                            firstName: profile.given_name || '',
                            lastName: profile.family_name || '',
                            name: profile.name || '',
                            picture: profile.picture || '',
                            provider: 'google',
                            providerId: profile.id,
                            signupDate: new Date().toISOString(),
                            accountType: 'individual'
                        };

                        processOAuthUser(userData, 'google');
                    } catch (error) {
                        console.error('Error fetching Google profile:', error);
                        showOAuthError('Error fetching your Google profile. Please try again.');
                    }
                }
            }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
        console.error('Google sign-in error:', error);
        showOAuthError('Error initiating Google sign-in. Please try again.');
    }
}

// ============================================================================
// MICROSOFT OAUTH IMPLEMENTATION
// ============================================================================
let msalInstance = null;

function initMicrosoftSignIn() {
    if (OAUTH_CONFIG.demoMode || !OAUTH_CONFIG.microsoft.clientId || OAUTH_CONFIG.microsoft.clientId.includes('YOUR_MICROSOFT')) {
        console.log('Microsoft OAuth: Demo mode active or credentials not configured');
        return;
    }

    if (typeof msal === 'undefined') {
        console.warn('Microsoft MSAL not loaded');
        return;
    }

    try {
        const msalConfig = {
            auth: {
                clientId: OAUTH_CONFIG.microsoft.clientId,
                authority: OAUTH_CONFIG.microsoft.authority,
                redirectUri: OAUTH_CONFIG.microsoft.redirectUri
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false
            }
        };

        msalInstance = new msal.PublicClientApplication(msalConfig);
        console.log('Microsoft OAuth initialized successfully');
    } catch (error) {
        console.error('Error initializing Microsoft OAuth:', error);
    }
}

async function handleMicrosoftSignInButton() {
    // Check if demo mode is enabled
    if (OAUTH_CONFIG.demoMode) {
        console.log('Microsoft Sign-In: Using demo mode');
        try {
            const userData = await simulateOAuthAuth('microsoft');
            processOAuthUser(userData, 'microsoft');
        } catch (error) {
            console.error('Demo OAuth error:', error);
            showOAuthError('Error with demo authentication. Please try again.');
        }
        return;
    }
    
    // Check if credentials are configured
    const hasMicrosoftCredentials = OAUTH_CONFIG.microsoft.clientId && 
                                    !OAUTH_CONFIG.microsoft.clientId.includes('YOUR_MICROSOFT');
    
    if (!hasMicrosoftCredentials) {
        // Fallback to demo mode if credentials not configured
        console.log('Microsoft OAuth not configured, using demo mode');
        try {
            const userData = await simulateOAuthAuth('microsoft');
            processOAuthUser(userData, 'microsoft');
        } catch (error) {
            showOAuthError('Microsoft Sign-In is not configured. Please set up OAuth credentials. See OAUTH_SETUP.md for instructions.');
        }
        return;
    }

    if (!msalInstance) {
        initMicrosoftSignIn();
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!msalInstance) {
        showOAuthError('Microsoft Sign-In is not available. Please check your configuration or enable demo mode.');
        return;
    }

    const loginRequest = {
        scopes: ['User.Read'],
        prompt: 'select_account'
    };

    try {
        const response = await msalInstance.loginPopup(loginRequest);
        
        if (response && response.account) {
            const graphEndpoint = 'https://graph.microsoft.com/v1.0/me';
            const token = response.accessToken;

            try {
                const userResponse = await fetch(graphEndpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userProfile = await userResponse.json();
                
                const userData = {
                    email: userProfile.mail || userProfile.userPrincipalName,
                    firstName: userProfile.givenName || '',
                    lastName: userProfile.surname || '',
                    name: userProfile.displayName || '',
                    picture: null,
                    provider: 'microsoft',
                    providerId: userProfile.id,
                    signupDate: new Date().toISOString(),
                    accountType: 'individual'
                };

                processOAuthUser(userData, 'microsoft');
            } catch (error) {
                console.error('Error fetching Microsoft user profile:', error);
                // Fallback: use account info from token
                const account = response.account;
                const userData = {
                    email: account.username,
                    firstName: account.name?.split(' ')[0] || '',
                    lastName: account.name?.split(' ').slice(1).join(' ') || '',
                    name: account.name || '',
                    picture: null,
                    provider: 'microsoft',
                    providerId: account.localAccountId,
                    signupDate: new Date().toISOString(),
                    accountType: 'individual'
                };
                processOAuthUser(userData, 'microsoft');
            }
        }
    } catch (error) {
        console.error('Microsoft sign-in error:', error);
        if (error.errorCode === 'user_cancelled' || error.message?.includes('User cancelled')) {
            // User cancelled, do nothing
            return;
        }
        showOAuthError('Error signing in with Microsoft. Please try again.');
    }
}

// ============================================================================
// OAUTH USER PROCESSING
// ============================================================================
function processOAuthUser(userData, provider) {
    try {
        // Validate user data
        if (!userData.email) {
            throw new Error('Email is required');
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('taxmind_users') || '{}');
        const existingUser = users[userData.email];

        if (existingUser) {
            // User exists - sign them in
            // Update with latest OAuth info
            const updatedUser = {
                ...existingUser,
                ...userData,
                oauthProvider: provider,
                lastLogin: new Date().toISOString()
            };
            
            users[userData.email] = updatedUser;
            localStorage.setItem('taxmind_users', JSON.stringify(users));
            localStorage.setItem('taxmind_current_user', JSON.stringify(updatedUser));
            localStorage.setItem('taxmind_logged_in', 'true');
            
            showOAuthSuccess('Sign in successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // New user - check if we should autofill form or auto-create
            if (OAUTH_CONFIG.autofillForm && window.location.pathname.includes('signup')) {
                // Autofill the signup form with OAuth data
                autofillSignupForm(userData, provider);
                showOAuthSuccess('Account information loaded! Please complete the form below.');
            } else {
                // Auto-create account (for login page or if autofill disabled)
                const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
                
                const newUser = {
                    ...userData,
                    password: randomPassword, // Not used for OAuth login
                    newsletter: false,
                    oauthProvider: provider
                };

                // Store user
                users[userData.email] = newUser;
                localStorage.setItem('taxmind_users', JSON.stringify(users));
                
                // Auto-login
                localStorage.setItem('taxmind_current_user', JSON.stringify(newUser));
                localStorage.setItem('taxmind_logged_in', 'true');

                // Send signup notification if function exists
                if (typeof sendSignupNotification === 'function') {
                    sendSignupNotification(newUser);
                }

                showOAuthSuccess('Account created successfully! Redirecting...');
                
                // Redirect to subscription page (for access code)
                setTimeout(() => {
                    window.location.href = 'subscription.html';
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Error processing OAuth user:', error);
        showOAuthError('Error processing authentication. Please try again.');
    }
}

// ============================================================================
// AUTOFILL SIGNUP FORM
// ============================================================================
function autofillSignupForm(userData, provider) {
    try {
        // Fill in form fields
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (firstNameInput && userData.firstName) {
            firstNameInput.value = userData.firstName;
            firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (lastNameInput && userData.lastName) {
            lastNameInput.value = userData.lastName;
            lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (emailInput && userData.email) {
            emailInput.value = userData.email;
            emailInput.readOnly = true; // Make email read-only since it's from OAuth
            emailInput.style.backgroundColor = '#f3f4f6';
            emailInput.style.cursor = 'not-allowed';
            emailInput.title = 'Email from ' + provider + ' account';
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Generate a secure random password and fill both password fields
        if (passwordInput && confirmPasswordInput) {
            const securePassword = generateSecurePassword();
            passwordInput.value = securePassword;
            confirmPasswordInput.value = securePassword;
            
            // Trigger password strength check if it exists
            if (typeof checkPasswordStrength === 'function') {
                checkPasswordStrength(securePassword);
            }
            
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            confirmPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Store OAuth data temporarily for form submission
        sessionStorage.setItem('oauth_user_data', JSON.stringify({
            ...userData,
            provider: provider
        }));

        // Scroll to form to show the filled fields
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Highlight the filled section
        showOAuthInfo('Your account information has been filled in. Please review and complete the form.');
    } catch (error) {
        console.error('Error autofilling form:', error);
        showOAuthError('Error filling form. Please fill it manually.');
    }
}

// Generate a secure password
function generateSecurePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

function showOAuthInfo(message) {
    // Remove any existing messages
    const existing = document.querySelector('.oauth-info-message');
    if (existing) existing.remove();

    const infoDiv = document.createElement('div');
    infoDiv.className = 'oauth-info-message';
    infoDiv.style.cssText = `
        background: #dbeafe;
        border: 2px solid #3b82f6;
        color: #1e40af;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;
    infoDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.insertBefore(infoDiv, signupForm.firstChild);
    } else {
        document.body.appendChild(infoDiv);
    }

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    if (!document.querySelector('#oauth-animations')) {
        style.id = 'oauth-animations';
        document.head.appendChild(style);
    }
}

// ============================================================================
// UI FEEDBACK FUNCTIONS
// ============================================================================
function showOAuthSuccess(message) {
    // Remove any existing messages
    const existing = document.querySelector('.oauth-message');
    if (existing) existing.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'oauth-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successDiv);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    if (!document.querySelector('#oauth-animations')) {
        style.id = 'oauth-animations';
        document.head.appendChild(style);
    }

    setTimeout(() => {
        successDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

function showOAuthError(message) {
    // Remove any existing messages
    const existing = document.querySelector('.oauth-message');
    if (existing) existing.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'oauth-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize OAuth providers
    if (typeof google !== 'undefined' && google.accounts) {
        initGoogleSignIn();
    } else {
        // Wait for Google script to load
        const checkGoogle = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                initGoogleSignIn();
                clearInterval(checkGoogle);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkGoogle), 5000);
    }

    initMicrosoftSignIn();

    // Google Sign-In buttons
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignInButton);
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleSignInButton);
    }

    // Microsoft Sign-In buttons
    const microsoftSignupBtn = document.getElementById('microsoftSignupBtn');
    const microsoftLoginBtn = document.getElementById('microsoftLoginBtn');

    if (microsoftSignupBtn) {
        microsoftSignupBtn.addEventListener('click', handleMicrosoftSignInButton);
    }

    if (microsoftLoginBtn) {
        microsoftLoginBtn.addEventListener('click', handleMicrosoftSignInButton);
    }

    // Show configuration status
    const hasGoogle = OAUTH_CONFIG.google.clientId && !OAUTH_CONFIG.google.clientId.includes('YOUR_GOOGLE');
    const hasMicrosoft = OAUTH_CONFIG.microsoft.clientId && !OAUTH_CONFIG.microsoft.clientId.includes('YOUR_MICROSOFT');
    
    if (!hasGoogle && !hasMicrosoft) {
        console.log('%c⚠️ OAuth Not Configured', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
        console.log('OAuth credentials are not set up. To enable Google/Microsoft sign-in:');
        console.log('1. Get OAuth credentials (see OAUTH_SETUP.md)');
        console.log('2. Update OAUTH_CONFIG in oauth-handler.js');
    } else {
        if (hasGoogle) console.log('%c✅ Google OAuth Configured', 'color: #10b981; font-weight: bold;');
        if (hasMicrosoft) console.log('%c✅ Microsoft OAuth Configured', 'color: #10b981; font-weight: bold;');
    }
});

// Export functions for use in other scripts
window.OAuthHandler = {
    initGoogleSignIn,
    initMicrosoftSignIn,
    handleGoogleSignIn,
    handleMicrosoftSignInButton,
    handleMicrosoftSignInButton,
    processOAuthUser,
    showOAuthSuccess,
    showOAuthError
};
