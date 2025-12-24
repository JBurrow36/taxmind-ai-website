// Frontend Security Check - Checks killswitch status and disables site if active
// This script runs on every page load to ensure security

const SecurityCheck = {
    config: {
        killswitchEndpoint: '/api/security/killswitch-status',
        killswitchFile: 'killswitch.json',
        checkInterval: 60000, // Check every minute
        redirectUrl: 'security-maintenance.html'
    },

    // Initialize security check
    async init() {
        // Check killswitch status immediately
        const isActive = await this.checkKillswitch();
        
        if (isActive) {
            this.handleKillswitchActive();
            return;
        }

        // Set up periodic checks
        setInterval(async () => {
            const active = await this.checkKillswitch();
            if (active) {
                this.handleKillswitchActive();
            }
        }, this.config.checkInterval);

        console.log('✅ Security check initialized');
    },

    // Check killswitch status
    async checkKillswitch() {
        try {
            // Try to fetch from API endpoint first
            try {
                const response = await fetch(this.config.killswitchEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-cache'
                });

                if (response.ok) {
                    const status = await response.json();
                    return status.active === true;
                }
            } catch (e) {
                // API endpoint not available, try file
            }

            // Fallback: Check killswitch.json file
            try {
                const response = await fetch(this.config.killswitchFile, {
                    method: 'GET',
                    cache: 'no-cache'
                });

                if (response.ok) {
                    const status = await response.json();
                    return status.activated === true;
                }
            } catch (e) {
                // File not available, assume inactive
            }

            return false;
        } catch (error) {
            console.error('Error checking killswitch:', error);
            // On error, assume inactive (fail open)
            return false;
        }
    },

    // Handle killswitch active
    handleKillswitchActive() {
        console.warn('🚨 Killswitch is ACTIVE. Site access disabled.');

        // Completely prevent interaction
        this.disableSiteCompletely();

        // Show maintenance message
        this.showMaintenanceMessage();

        // Redirect to maintenance page if it exists
        if (window.location.pathname !== '/maintenance.html') {
            // Check if maintenance page exists, otherwise show overlay
            fetch('maintenance.html')
                .then(response => {
                    if (response.ok) {
                        window.location.href = 'maintenance.html';
                    }
                })
                .catch(() => {
                    // Maintenance page doesn't exist, overlay will be shown
                });
        }
    },

    // Completely disable site functionality
    disableSiteCompletely() {
        // Hide all content
        const body = document.body;
        if (body) {
            body.style.display = 'none';
            body.style.pointerEvents = 'none';
            body.style.userSelect = 'none';
        }

        // Disable all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.display = 'none';
            form.disabled = true;
        });

        // Disable all buttons
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });

        // Stop all video/audio
        const media = document.querySelectorAll('video, audio, iframe');
        media.forEach(media => {
            if (media.pause) media.pause();
            media.style.display = 'none';
        });

        // Prevent navigation
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = '';
        });

        // Block all network requests (optional, aggressive)
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            console.warn('🚨 Site disabled - Request blocked:', args[0]);
            return Promise.reject(new Error('Site disabled by security killswitch'));
        };
    },

    // Show maintenance message
    showMaintenanceMessage() {
        // Remove existing message if any
        const existing = document.getElementById('security-maintenance-message');
        if (existing) {
            existing.remove();
        }

        // Create maintenance overlay
        const overlay = document.createElement('div');
        overlay.id = 'security-maintenance-message';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="text-align: center; max-width: 600px; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">Security Maintenance</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #cbd5e1;">
                    Our security system has detected a potential threat and has temporarily disabled access to protect our systems and your data.
                </p>
                <p style="font-size: 1rem; color: #94a3b8;">
                    We're working to resolve this issue as quickly as possible. Please check back soon.
                </p>
                <div style="margin-top: 2rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <p style="font-size: 0.9rem; color: #fca5a5;">
                        <strong>Note:</strong> This is an automated security measure. The site will automatically restore access once the security check passes.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SecurityCheck.init();
    });
} else {
    SecurityCheck.init();
}

