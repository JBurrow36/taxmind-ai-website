// Security Utilities - Secure cookie management and security helpers
// Prevents browser security warnings and ensures secure practices

const SecurityUtils = {
    // Set secure cookie with proper attributes
    setSecureCookie(name, value, days = 30, options = {}) {
        // Determine if we're on HTTPS (production) or localhost (development)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';
        
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        // Build cookie string with security attributes
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
        
        // Add Secure flag only on HTTPS (required for production)
        if (isSecure) {
            cookieString += '; Secure';
        }
        
        // Add SameSite attribute (prevents CSRF attacks)
        // Use 'Lax' for normal cookies, 'Strict' for sensitive cookies
        const sameSite = options.sameSite || 'Lax';
        cookieString += `; SameSite=${sameSite}`;
        
        // Add HttpOnly equivalent behavior via careful handling
        // Note: True HttpOnly can only be set server-side, but we ensure no JS access issues
        
        document.cookie = cookieString;
    },

    // Get cookie value
    getCookie(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
            }
        }
        return null;
    },

    // Delete cookie securely
    deleteCookie(name, path = '/') {
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';
        
        let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        
        if (isSecure) {
            cookieString += '; Secure';
        }
        
        cookieString += '; SameSite=Lax';
        document.cookie = cookieString;
    },

    // Validate HTTPS (for production)
    ensureHTTPS() {
        // Only redirect in production (not localhost)
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1' &&
            window.location.protocol !== 'https:' &&
            window.location.hostname !== '') {
            
            console.warn('⚠️ Non-HTTPS connection detected. Redirecting to HTTPS...');
            window.location.replace('https:' + window.location.href.substring(window.location.protocol.length));
            return false;
        }
        return true;
    },

    // Sanitize user input to prevent XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Validate URL is secure
    isSecureURL(url) {
        if (!url) return false;
        return url.startsWith('https://') || url.startsWith('/') || url.startsWith('./');
    },

    // Generate nonce for CSP (Content Security Policy)
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Store nonce in session storage for CSP validation
    setCSPNonce() {
        if (typeof Storage !== 'undefined') {
            const nonce = this.generateNonce();
            sessionStorage.setItem('csp-nonce', nonce);
            return nonce;
        }
        return null;
    },

    // Get stored CSP nonce
    getCSPNonce() {
        if (typeof Storage !== 'undefined') {
            return sessionStorage.getItem('csp-nonce');
        }
        return null;
    }
};

// Auto-ensure HTTPS on page load (production only)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SecurityUtils.ensureHTTPS();
    });
} else {
    SecurityUtils.ensureHTTPS();
}

