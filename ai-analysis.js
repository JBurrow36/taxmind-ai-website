// AI Analysis functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page (will start analysis if needed)
    initializePage();
});

function initializePage() {
    // Check if files are ready for analysis
    const filesReady = localStorage.getItem('taxmind_files_ready_for_analysis') === 'true';
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    
    // Verify required elements exist
    const analysisResults = document.getElementById('analysisResults');
    if (!analysisResults) {
        console.error('Analysis results element not found on page load!');
        showNotification('Error: Page elements not loaded correctly. Please refresh.', 'error');
        return;
    }
    
    if (!filesReady || Object.keys(uploadedFiles).length === 0) {
        showNotification('Please upload documents first before running analysis.', 'warning');
        // Redirect to upload page
        setTimeout(() => {
            window.location.href = 'upload-documents.html';
        }, 2000);
        return;
    }
    
    // Display uploaded files
    displayUploadedFiles(uploadedFiles);
    
    // Check if analysis is already completed
    const analysisCompleted = localStorage.getItem('taxmind_analysis_completed') === 'true';
    
    console.log('Initializing page - Analysis completed:', analysisCompleted, 'Files ready:', filesReady);
    
    if (analysisCompleted) {
        console.log('Showing previously completed results...');
        showCompletedResults();
    } else {
        console.log('Starting new analysis...');
        startAnalysis();
    }
}

function displayUploadedFiles(files) {
    const filesList = document.getElementById('uploadedFilesList');
    if (!filesList) return;
    
    filesList.innerHTML = '';
    
    Object.entries(files).forEach(([fileId, file]) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Add tax type badge if available
        const taxTypeBadge = file.taxType ? 
            `<span class="tax-type-badge" style="
                background: #dbeafe;
                color: #1e40af;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 8px;
                display: inline-block;
            ">${file.taxTypeName || file.taxType}</span>` : '';
        
        fileItem.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="file-info">
                <div class="file-name">
                    ${file.name}
                    ${taxTypeBadge}
                </div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-status ${file.analyzed ? 'status-completed' : 'status-pending'}">
                <i class="fas ${file.analyzed ? 'fa-check-circle' : 'fa-clock'}"></i>
                ${file.analyzed ? 'Analyzed' : 'Pending'}
            </div>
        `;
        filesList.appendChild(fileItem);
    });
}

// Generate highlights for all uploaded files (if highlight engine is available)
function generateDocumentHighlightsIfAvailable() {
    if (typeof HighlightEngine === 'undefined' || typeof RedFlagDetector === 'undefined') {
        return; // Highlight engine not loaded
    }
    
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    const accountType = currentUser.accountType || 'individual';
    
    // Detect primary tax type
    const taxTypeSummary = JSON.parse(localStorage.getItem('taxmind_detected_tax_types') || '{}');
    let primaryTaxType = 'income';
    let maxCount = 0;
    Object.keys(taxTypeSummary).forEach(typeId => {
        if (taxTypeSummary[typeId].count > maxCount) {
            maxCount = taxTypeSummary[typeId].count;
            primaryTaxType = typeId;
        }
    });
    
    // Generate highlights for each file
    Object.keys(uploadedFiles).forEach(fileId => {
        const file = uploadedFiles[fileId];
        // Note: In a real implementation, you'd extract actual content from the file
        // For now, we'll use file metadata
        const documentContent = file.name + ' ' + (file.contentSnippet || '');
        
        HighlightEngine.analyzeDocument(fileId, documentContent, file.taxType || primaryTaxType, accountType)
            .then(highlights => {
                // Store highlights for document viewer
                const existingHighlights = JSON.parse(localStorage.getItem('taxmind_document_highlights') || '{}');
                existingHighlights[fileId] = highlights;
                localStorage.setItem('taxmind_document_highlights', JSON.stringify(existingHighlights));
            })
            .catch(err => console.error('Error generating highlights:', err));
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startAnalysis() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const analysisProgress = document.getElementById('analysisProgress');
    const analysisResults = document.getElementById('analysisResults');
    
    // Check if required elements exist
    if (!progressBar || !progressText) {
        console.error('Required progress elements not found!');
        showNotification('Error: Page elements not found. Please refresh the page.', 'error');
        return;
    }
    
    // Get uploaded files information
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const fileCount = Object.keys(uploadedFiles).length;
    
    // Detect primary tax type from uploaded files (considering account type)
    const taxTypeSummary = JSON.parse(localStorage.getItem('taxmind_detected_tax_types') || '{}');
    let primaryTaxType = 'income'; // default
    
    // Find the most common tax type
    let maxCount = 0;
    Object.keys(taxTypeSummary).forEach(typeId => {
        if (taxTypeSummary[typeId].count > maxCount) {
            maxCount = taxTypeSummary[typeId].count;
            primaryTaxType = typeId;
        }
    });
    
    // Get user account type
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    const accountType = currentUser.accountType || 'individual';
    
    const taxTypeInfo = TaxTypeDetector.getTaxTypeById(primaryTaxType);
    
    // Update progress text
    progressText.textContent = `Analyzing ${fileCount} ${taxTypeInfo.name.toLowerCase()} documents...`;
    
    // Get tax-specific analysis steps based on account type
    const analysisStepsList = TaxTypeDetector.getAnalysisSteps(primaryTaxType, accountType);
    const steps = analysisStepsList.map((text, index) => ({
        text: text,
        step: Math.floor((index / analysisStepsList.length) * 4) + 1
    }));
    
    let progress = 0;
    let currentStep = 1;
    let lastInsightUpdate = 0;
    let lastStepIndex = -1;
    
    // Pre-calculate tax benefits outside the interval for performance
    const taxBenefits = TaxTypeDetector.getTaxBenefits(primaryTaxType, accountType);
    // taxTypeInfo already declared above, reuse it
    
    const interval = setInterval(() => {
        // Increase progress increment slightly for faster completion (4-12% instead of 2-10%)
        progress += Math.random() * 8 + 4;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Complete the analysis with tax type
            completeAnalysis(primaryTaxType);
            return;
        }
        
        // Update progress bar
        progressBar.style.width = progress + '%';
        
        // Update progress text and steps (only when step changes to avoid unnecessary updates)
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex < steps.length && stepIndex !== lastStepIndex) {
            progressText.textContent = steps[stepIndex].text;
            updateAnalysisStep(steps[stepIndex].step);
            lastStepIndex = stepIndex;
        }
        
        // Update insights less frequently (only at key milestones to improve performance)
        if (progress - lastInsightUpdate >= 25) {
            updateInsights(progress, primaryTaxType, taxBenefits, taxTypeInfo);
            lastInsightUpdate = progress;
        }
        
    }, 500); // Reduced interval from 800ms to 500ms for faster updates
}

function updateAnalysisStep(stepNumber) {
    // Only update if step number changed (optimization)
    if (window.currentAnalysisStep === stepNumber) return;
    window.currentAnalysisStep = stepNumber;
    
    // Reset all steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (!step) continue; // Skip if element doesn't exist
        
        const status = step.querySelector('.step-status');
        if (!status) continue;
        
        step.classList.remove('active', 'completed');
        status.className = 'step-status status-pending';
        status.textContent = 'Pending';
    }
    
    // Update current and completed steps
    for (let i = 1; i <= stepNumber; i++) {
        const step = document.getElementById(`step${i}`);
        if (!step) continue; // Skip if element doesn't exist
        
        const status = step.querySelector('.step-status');
        if (!status) continue;
        
        if (i < stepNumber) {
            step.classList.add('completed');
            status.className = 'step-status status-completed';
            status.textContent = 'Completed';
        } else if (i === stepNumber) {
            step.classList.add('active');
            status.className = 'step-status status-active';
            status.textContent = 'In Progress';
        }
    }
}

function updateInsights(progress, taxTypeId = 'income', taxBenefits = null, taxTypeInfo = null) {
    const insights = document.getElementById('aiInsights');
    
    // Use pre-calculated values if provided (for performance), otherwise calculate
    if (!taxBenefits || !taxTypeInfo) {
        const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
        const accountType = currentUser.accountType || 'individual';
        if (!taxBenefits) taxBenefits = TaxTypeDetector.getTaxBenefits(taxTypeId, accountType);
        if (!taxTypeInfo) taxTypeInfo = TaxTypeDetector.getTaxTypeById(taxTypeId);
    }
    
    // Update insights based on progress
    if (progress > 25) {
        const benefitCount = Math.min(taxBenefits.length, 8);
        updateInsightValue(0, `${benefitCount} tax categories identified`);
    }
    
    if (progress > 50) {
        updateInsightValue(1, `${taxTypeInfo.name} analysis`);
    }
    
    if (progress > 75) {
        updateInsightValue(2, 'Analysis optimized');
    }
}

function updateInsightValue(index, value) {
    const insightItems = document.querySelectorAll('.insight-item');
    if (insightItems[index]) {
        const valueElement = insightItems[index].querySelector('.insight-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
}

function completeAnalysis(taxTypeId = 'income') {
    // Update progress to 100%
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Analysis complete!';
    
    // Mark all steps as completed
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (!step) continue;
        
        const status = step.querySelector('.step-status');
        if (!status) continue;
        
        step.classList.remove('active');
        step.classList.add('completed');
        status.className = 'step-status status-completed';
        status.textContent = 'Completed';
    }
    
    // Mark uploaded files as analyzed
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    Object.keys(uploadedFiles).forEach(fileId => {
        uploadedFiles[fileId].analyzed = true;
    });
    localStorage.setItem('taxmind_uploaded_files', JSON.stringify(uploadedFiles));
    
    // Store tax type for report generation
    localStorage.setItem('taxmind_primary_tax_type', taxTypeId);
    
    if (extractedData && (extractedData.totalIncome > 0 || extractedData.totalWages > 0)) {
        // We have real data - display it
        displayExtractedData(extractedData);
    } else {
        // Show data warning - no extracted data available
        const warningElement = document.getElementById('analysisDataWarning');
        if (warningElement) {
            warningElement.style.display = 'block';
        }
        
        // Clear any fake values from result cards
        const resultValues = ['totalIncome', 'totalDeductions', 'taxOwed', 'estimatedRefund'];
        resultValues.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.textContent.includes('$')) {
                element.textContent = '—';
                element.style.color = '#94a3b8';
                element.style.fontStyle = 'italic';
            }
        });
        
        // Hide deductions section if no real data
        const deductionsFound = document.getElementById('deductionsFound');
        if (deductionsFound) {
            deductionsFound.style.display = 'none';
        }
    }
    
    // Hide progress section and show results
    setTimeout(() => {
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        
        if (!analysisResults) {
            console.error('Analysis results element not found!');
            showNotification('Error: Could not display results. Please refresh the page.', 'error');
            return;
        }
        
        if (analysisProgress) {
            analysisProgress.style.display = 'none';
        }
        
        // Show results section - use multiple methods to ensure visibility
        console.log('Showing analysis results...');
        analysisResults.style.display = 'block';
        analysisResults.style.visibility = 'visible';
        analysisResults.style.opacity = '1';
        
        // Remove any hidden class if present
        analysisResults.classList.remove('hidden');
        
        // Force a reflow to ensure the display change takes effect
        void analysisResults.offsetHeight;
        
        console.log('Analysis results displayed. Element visible:', 
            window.getComputedStyle(analysisResults).display !== 'none');
        
        // Scroll to results after a brief delay to ensure it's rendered
        setTimeout(() => {
            try {
                analysisResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                // Fallback if scrollIntoView fails
                window.scrollTo({
                    top: analysisResults.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }, 100);
        
        // Extract data from documents if parser is available (in background)
        if (typeof DocumentParser !== 'undefined') {
            extractAllDocumentData().then(() => {
                // After extraction, try to load and display data
                const extractedData = loadExtractedFinancialData();
                if (extractedData && (extractedData.totalIncome > 0 || extractedData.totalWages > 0)) {
                    displayExtractedData(extractedData);
                }
            });
        }
        
        // Update results based on tax type
        updateResultsForTaxType(taxTypeId);
        
        // Try to load extracted financial data from documents immediately
        const extractedData = loadExtractedFinancialData();
        if (extractedData && (extractedData.totalIncome > 0 || extractedData.totalWages > 0)) {
            // We have real data - display it
            displayExtractedData(extractedData);
        } else {
            // Show data warning - no extracted data available
            const warningElement = document.getElementById('analysisDataWarning');
            if (warningElement) {
                warningElement.style.display = 'block';
            }
            
            // Clear any fake values from result cards
            const resultValues = ['totalIncome', 'totalDeductions', 'taxOwed', 'estimatedRefund'];
            resultValues.forEach(id => {
                const element = document.getElementById(id);
                if (element && element.textContent.includes('$')) {
                    element.textContent = '—';
                    element.style.color = '#94a3b8';
                    element.style.fontStyle = 'italic';
                }
            });
            
            // Hide deductions section if no real data
            const deductionsFound = document.getElementById('deductionsFound');
            if (deductionsFound) {
                deductionsFound.style.display = 'none';
            }
        }
        
        // Animate results
        animateResults();
        
        // Store completion status and date
        localStorage.setItem('taxmind_analysis_completed', 'true');
        localStorage.setItem('taxmind_analysis_date', new Date().toISOString());
        
        // Generate highlights for document viewer (if available)
        generateDocumentHighlightsIfAvailable();
        
        // Collect training data with analysis results
        if (typeof AITrainingSystem !== 'undefined' && typeof window.taxmindCollectTrainingData === 'function') {
            const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
            const analysisResults = {
                taxType: taxTypeId,
                completedAt: new Date().toISOString(),
                fileCount: Object.keys(uploadedFiles).length
            };
            
            // Collect training data for each analyzed file
            Object.values(uploadedFiles).forEach(file => {
                if (file.analyzed) {
                    const detectionResult = {
                        typeId: file.taxType,
                        typeName: file.taxTypeName,
                        confidence: file.taxTypeConfidence,
                        accountType: AITrainingSystem.config ? 
                            JSON.parse(localStorage.getItem('taxmind_current_user') || '{}').accountType : 'individual'
                    };
                    
                    window.taxmindCollectTrainingData(
                        { name: file.name, type: file.type, size: file.size, content: '' },
                        detectionResult,
                        analysisResults
                    );
                }
            });
        }
        
        // Show success notification
        showNotification('AI analysis completed successfully!', 'success');
    }, 1000);
}

function updateResultsForTaxType(taxTypeId) {
    try {
        // Update result cards based on tax type
        if (typeof TaxTypeDetector === 'undefined') {
            console.warn('TaxTypeDetector not available');
            return;
        }
        
        const taxType = TaxTypeDetector.getTaxTypeById(taxTypeId);
        if (!taxType) {
            console.warn(`Tax type ${taxTypeId} not found, using default`);
            return;
        }
        
        // Update page description or titles if needed
        const resultsTitle = document.querySelector('.results-title');
        if (resultsTitle) {
            resultsTitle.textContent = `${taxType.name} Analysis Complete!`;
        }
        
        // Log analysis guidelines for debugging/reference
        if (typeof DocumentAnalysisGuide !== 'undefined') {
            try {
                const guidelines = DocumentAnalysisGuide.getAnalysisGuidelines(taxTypeId);
                console.log(`Analysis Guidelines for ${taxType.name}:`, {
                    whatToLookFor: guidelines.whatToLookFor,
                    keyFields: guidelines.keyFields,
                    analysisFocus: guidelines.analysisFocus
                });
            } catch (e) {
                console.warn('Error getting analysis guidelines:', e);
            }
        }
    } catch (error) {
        console.error('Error updating results for tax type:', error);
        // Don't throw - we still want to show results even if this fails
    }
}

function animateResults() {
    const resultValues = document.querySelectorAll('.result-value');
    
    resultValues.forEach((element, index) => {
        setTimeout(() => {
            animateCounter(element, element.textContent, index);
        }, index * 200);
    });
}

function animateCounter(element, targetValue, index) {
    const isDollar = targetValue.includes('$');
    const isPercentage = targetValue.includes('%');
    const numericValue = parseFloat(targetValue.replace(/[$,%]/g, ''));
    
    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.round(current);
        if (isDollar) {
            displayValue = '$' + displayValue.toLocaleString();
        } else if (isPercentage) {
            displayValue = displayValue + '%';
        }
        
        element.textContent = displayValue;
    }, 50);
}

function showCompletedResults() {
    // Hide progress section
    const analysisProgress = document.getElementById('analysisProgress');
    const analysisResults = document.getElementById('analysisResults');
    
    if (analysisProgress) {
        analysisProgress.style.display = 'none';
    }
    
    // Show results
    if (!analysisResults) {
        console.error('Analysis results element not found!');
        showNotification('Error: Could not display results. Please refresh the page.', 'error');
        return;
    }
    
    console.log('Showing completed analysis results...');
    analysisResults.style.display = 'block';
    analysisResults.style.visibility = 'visible';
    analysisResults.style.opacity = '1';
    analysisResults.classList.remove('hidden');
    
    // Force a reflow
    void analysisResults.offsetHeight;
    
    // Scroll to results
    setTimeout(() => {
        try {
            analysisResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
            window.scrollTo({
                top: analysisResults.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }, 100);
    
    // Get tax type for display
    const taxTypeId = localStorage.getItem('taxmind_primary_tax_type') || 'income';
    updateResultsForTaxType(taxTypeId);
    
    // Mark all steps as completed
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (!step) continue;
        
        const status = step.querySelector('.step-status');
        if (!status) continue;
        
        step.classList.remove('active');
        step.classList.add('completed');
        status.className = 'step-status status-completed';
        status.textContent = 'Completed';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // R to restart analysis
    if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        restartAnalysis();
    }
});

function restartAnalysis() {
    // Clear completion status
    localStorage.removeItem('taxmind_analysis_completed');
    
    // Reset UI
    document.getElementById('analysisProgress').style.display = 'block';
    document.getElementById('analysisResults').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = 'Starting analysis...';
    
    // Restart analysis
    startAnalysis();
}

