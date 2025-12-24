// Legal Terms Loader
// Fetches compiled legal terms from the backend API and displays them

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('legal-terms-container');
    
    if (!container) {
        console.warn('Legal terms container not found');
        return;
    }

    try {
        // Fetch compiled legal terms from the API
        const response = await fetch('http://localhost:3001/api/legal-terms/compiled');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.terms || data.terms.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Legal terms are being collected and will be displayed here once available.</p>
                    <p style="font-size: 0.9em; margin-top: 0.5rem;">The legal terms scraper is constantly monitoring IRS policies and legal tax companies for updates.</p>
                </div>
            `;
            return;
        }
        
        // Display legal terms by category
        let html = '<div class="legal-terms-intro">';
        html += `<p><strong>Legal Terms and Compliance Information</strong></p>`;
        html += `<p class="legal-terms-stats">${data.sources} sources monitored | Last updated: ${data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : 'Never'}</p>`;
        html += `<p>This information is automatically collected from IRS policies and legal tax companies to keep our Terms of Service up-to-date.</p>`;
        html += '</div>';
        
        // Display terms by category
        Object.keys(data.categories).forEach(category => {
            html += `<div class="legal-terms-section">`;
            html += `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
            html += `<ul class="legal-terms-list">`;
            
            data.categories[category].forEach(term => {
                html += `<li class="legal-term-item">`;
                html += `<div class="legal-term-content">`;
                html += `<span class="legal-term-text">${term.content.substring(0, 500)}${term.content.length > 500 ? '...' : ''}</span>`;
                if (term.keywords && term.keywords.length > 0) {
                    html += `<div style="margin-top: 0.5rem;"><strong>Keywords:</strong> ${term.keywords.join(', ')}</div>`;
                }
                html += `<span class="legal-term-source">Source: <a href="${term.url}" target="_blank">${term.source}</a></span>`;
                html += `</div>`;
                html += `</li>`;
            });
            
            html += `</ul>`;
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading legal terms:', error);
        container.innerHTML = `
            <div class="legal-terms-error">
                <p><strong>Unable to load legal terms</strong></p>
                <p>Please ensure the backend API is running on http://localhost:3001</p>
                <p style="font-size: 0.9em; color: #64748b;">Error: ${error.message}</p>
            </div>
        `;
    }
});

