// Script to add security meta tags to HTML files
// Run with: node add-security-meta.js

const fs = require('fs');
const path = require('path');

const securityMetaTags = `
    <!-- Security Meta Tags -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    
    <!-- Performance and Security: Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
`;

const securityScript = `
    <!-- Security Utilities -->
    <script src="security-utils.js" defer></script>
`;

const htmlFiles = [
    'index.html',
    'login.html',
    'signup.html',
    'dashboard.html',
    'upload-documents.html',
    'ai-analysis.html',
    'privacy-policy.html',
    'terms-of-service.html',
    'subscription.html',
    'file-taxes.html',
    'view-report.html',
    'tutorial.html'
];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if security tags already exist
    if (content.includes('X-UA-Compatible')) {
        console.log(`✅ ${file} already has security tags`);
        return;
    }
    
    // Find the insertion point (after viewport meta tag)
    const viewportPattern = /(<meta name="viewport"[^>]*>)/i;
    const match = content.match(viewportPattern);
    
    if (match) {
        // Insert security meta tags after viewport
        content = content.replace(
            viewportPattern,
            `$1${securityMetaTags}`
        );
        
        // Add security-utils.js before closing </head> (if not already present)
        if (!content.includes('security-utils.js')) {
            const headClosePattern = /(<\/head>)/i;
            content = content.replace(headClosePattern, `${securityScript}$1`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${file} with security tags`);
    } else {
        console.log(`⚠️  Could not find viewport meta tag in ${file}`);
    }
});

console.log('\n✅ Security meta tags addition complete!');

