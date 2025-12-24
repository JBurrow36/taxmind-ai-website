// OAuth Configuration Checker
// Run this to verify your OAuth setup is correct

function checkOAuthConfig() {
    const issues = [];
    const warnings = [];
    const info = [];

    console.log('%c🔍 OAuth Configuration Checker', 'color: #2563eb; font-weight: bold; font-size: 16px;');
    console.log('═══════════════════════════════════════════════════════════');

    // Check if oauth-handler.js is loaded
    if (typeof OAuthHandler === 'undefined') {
        issues.push('oauth-handler.js is not loaded');
    } else {
        info.push('✓ oauth-handler.js is loaded');
    }

    // Check Google configuration
    if (OAUTH_CONFIG.demoMode) {
        warnings.push('⚠ Demo mode is enabled - OAuth will use simulated authentication');
    }

    if (!OAUTH_CONFIG.google.clientId || OAUTH_CONFIG.google.clientId.includes('YOUR_GOOGLE')) {
        warnings.push('⚠ Google Client ID not configured');
        info.push('  → Get it from: https://console.cloud.google.com/apis/credentials');
    } else {
        info.push('✓ Google Client ID is configured');
        
        // Check if Google script is loaded
        if (typeof google === 'undefined' || !google.accounts) {
            warnings.push('⚠ Google Identity Services script not loaded');
        } else {
            info.push('✓ Google Identity Services is loaded');
        }
    }

    // Check Microsoft configuration
    if (!OAUTH_CONFIG.microsoft.clientId || OAUTH_CONFIG.microsoft.clientId.includes('YOUR_MICROSOFT')) {
        warnings.push('⚠ Microsoft Client ID not configured');
        info.push('  → Get it from: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps');
    } else {
        info.push('✓ Microsoft Client ID is configured');
        
        // Check if MSAL is loaded
        if (typeof msal === 'undefined') {
            warnings.push('⚠ Microsoft MSAL script not loaded');
        } else {
            info.push('✓ Microsoft MSAL is loaded');
        }
    }

    // Check redirect URI
    const currentOrigin = window.location.origin;
    if (OAUTH_CONFIG.microsoft.redirectUri !== currentOrigin) {
        warnings.push(`⚠ Microsoft redirect URI (${OAUTH_CONFIG.microsoft.redirectUri}) doesn't match current origin (${currentOrigin})`);
    } else {
        info.push('✓ Redirect URI matches current origin');
    }

    // Display results
    console.log('\n📋 Configuration Status:');
    info.forEach(msg => console.log(`  ${msg}`));
    
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (issues.length > 0) {
        console.log('\n❌ Issues:');
        issues.forEach(msg => console.log(`  ${msg}`));
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    if (issues.length === 0 && warnings.length === 0) {
        console.log('%c✅ All checks passed! OAuth is ready to use.', 'color: #10b981; font-weight: bold;');
    } else if (issues.length === 0) {
        console.log('%c⚠️  Configuration has warnings but should work in demo mode.', 'color: #f59e0b; font-weight: bold;');
    } else {
        console.log('%c❌ Configuration has issues that need to be fixed.', 'color: #ef4444; font-weight: bold;');
    }
    console.log('\n💡 Tip: See OAUTH_SETUP.md for detailed setup instructions\n');
}

// Auto-run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkOAuthConfig, 1000); // Wait for scripts to load
    });
} else {
    setTimeout(checkOAuthConfig, 1000);
}

// Make it available globally
window.checkOAuthConfig = checkOAuthConfig;

