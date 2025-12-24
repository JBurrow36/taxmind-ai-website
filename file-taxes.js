// File Taxes functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the filing process
    initializeFiling();
    
    // Set up form validation
    setupFormValidation();
    
    // Check if already filed
    checkFilingStatus();
});

async function initializeFiling() {
    // Check if analysis is completed
    const analysisCompleted = localStorage.getItem('taxmind_analysis_completed') === 'true';
    
    if (!analysisCompleted) {
        showNotification('Please complete AI analysis first.', 'warning');
        // Redirect to analysis page
        setTimeout(() => {
            window.location.href = 'ai-analysis.html';
        }, 2000);
        return;
    }
    
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('taxmind_current_user') || '{}');
    
    // Pre-fill form with user data
    if (currentUser.firstName && currentUser.lastName) {
        // Update page title
        document.title = `File Taxes - ${currentUser.firstName} ${currentUser.lastName} - TaxMind AI`;
    }
    
    // Check if business account and show business questionnaire prompt
    if (currentUser.accountType === 'business') {
        const businessQuestionnaire = localStorage.getItem('taxmind_business_questionnaire');
        const businessPrompt = document.getElementById('businessQuestionnairePrompt');
        
        if (!businessQuestionnaire && businessPrompt) {
            businessPrompt.style.display = 'block';
        }
    }
    
    // Load and display extracted financial data
    await loadFilingSummaryData();
}

// Load extracted financial data for filing summary
async function loadFilingSummaryData() {
    // Try to extract data from documents if parser is available and data hasn't been extracted yet
    if (typeof DocumentParser !== 'undefined') {
        const extractedData = loadFilingFinancialData();
        
        // If no data found, try to extract it now
        if (!extractedData || (extractedData.totalIncome === 0 && extractedData.totalWages === 0)) {
            // Show loading indicator
            showExtractionInProgress();
            
            // Extract data and wait for completion
            try {
                await extractAllDocumentDataForFiling();
                
                // Poll for extracted data with timeout
                const maxAttempts = 10;
                let attempts = 0;
                const pollInterval = 500; // 500ms between checks
                
                const checkForData = () => {
                    attempts++;
                    const newData = loadFilingFinancialData();
                    
                    if (newData && (newData.totalIncome > 0 || newData.totalWages > 0)) {
                        hideExtractionInProgress();
                        displayFilingSummaryData(newData);
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkForData, pollInterval);
                    } else {
                        hideExtractionInProgress();
                        showNotification('Data extraction completed, but no financial data was found in your documents.', 'info');
                    }
                };
                
                // Start polling after a brief delay
                setTimeout(checkForData, pollInterval);
            } catch (error) {
                hideExtractionInProgress();
                console.error('Error during data extraction:', error);
                showNotification('Error extracting data from documents. Please try re-uploading your files.', 'error');
            }
            return;
        } else {
            displayFilingSummaryData(extractedData);
        }
    } else {
        // Try to load existing extracted data
        const extractedData = loadFilingFinancialData();
        if (extractedData && (extractedData.totalIncome > 0 || extractedData.totalWages > 0)) {
            displayFilingSummaryData(extractedData);
        }
    }
}

// Load extracted financial data
function loadFilingFinancialData() {
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    const totals = {
        totalIncome: 0,
        totalWages: 0,
        totalDeductions: 0,
        totalTaxWithheld: 0,
        totalTaxOwed: 0,
        totalRefund: 0
    };
    
    Object.keys(uploadedFiles).forEach(fileId => {
        const extractionKey = `taxmind_extracted_data_${fileId}`;
        const extractedData = localStorage.getItem(extractionKey);
        
        if (extractedData) {
            try {
                const data = JSON.parse(extractedData);
                
                if (data.income || data.wages) {
                    const amount = data.income || data.wages;
                    totals.totalIncome += amount;
                    totals.totalWages += data.wages || 0;
                }
                
                if (data.deductions) totals.totalDeductions += data.deductions;
                if (data.taxWithheld) totals.totalTaxWithheld += data.taxWithheld;
                if (data.taxOwed) totals.totalTaxOwed += data.taxOwed;
                if (data.refund) totals.totalRefund += data.refund;
            } catch (e) {
                console.error('Error parsing extracted data:', e);
            }
        }
    });
    
    // Calculate estimated refund
    if (totals.totalTaxWithheld > 0 && totals.totalTaxOwed > 0) {
        totals.estimatedRefund = Math.max(0, totals.totalTaxWithheld - totals.totalTaxOwed);
    }
    
    return totals.totalIncome > 0 || totals.totalWages > 0 ? totals : null;
}

// Display financial data in filing summary
function displayFilingSummaryData(data) {
    // Update Total Income
    const incomeEl = document.getElementById('filingTotalIncome');
    if (incomeEl) {
        if (data.totalIncome > 0 || data.totalWages > 0) {
            incomeEl.textContent = '$' + Math.round(data.totalIncome || data.totalWages).toLocaleString();
            incomeEl.style.color = 'white';
            incomeEl.style.fontStyle = 'normal';
        } else {
            incomeEl.textContent = '—';
            incomeEl.style.color = '#94a3b8';
            incomeEl.style.fontStyle = 'italic';
        }
    }
    
    // Update Total Deductions
    const deductionsEl = document.getElementById('filingTotalDeductions');
    if (deductionsEl) {
        if (data.totalDeductions > 0) {
            deductionsEl.textContent = '$' + Math.round(data.totalDeductions).toLocaleString();
            deductionsEl.style.color = 'white';
            deductionsEl.style.fontStyle = 'normal';
        } else {
            deductionsEl.textContent = '—';
            deductionsEl.style.color = '#94a3b8';
            deductionsEl.style.fontStyle = 'italic';
        }
    }
    
    // Update Estimated Refund
    const refundEl = document.getElementById('filingEstimatedRefund');
    if (refundEl) {
        const refund = data.totalRefund || data.estimatedRefund || 0;
        if (refund > 0) {
            refundEl.textContent = '$' + Math.round(refund).toLocaleString();
            refundEl.style.color = '#10b981';
            refundEl.style.fontStyle = 'normal';
        } else {
            refundEl.textContent = '—';
            refundEl.style.color = '#94a3b8';
            refundEl.style.fontStyle = 'italic';
        }
    }
}

// Show extraction in progress indicator
function showExtractionInProgress() {
    const incomeEl = document.getElementById('filingTotalIncome');
    const deductionsEl = document.getElementById('filingTotalDeductions');
    const refundEl = document.getElementById('filingEstimatedRefund');
    
    if (incomeEl) incomeEl.textContent = '...';
    if (deductionsEl) deductionsEl.textContent = '...';
    if (refundEl) refundEl.textContent = '...';
}

// Hide extraction in progress indicator
function hideExtractionInProgress() {
    // Function exists for consistency, actual updates happen in displayFilingSummaryData
}

// Extract data from all uploaded files for filing
async function extractAllDocumentDataForFiling() {
    const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
    
    for (const [fileId, file] of Object.entries(uploadedFiles)) {
        // Check if data already extracted
        const extractionKey = `taxmind_extracted_data_${fileId}`;
        const existingData = localStorage.getItem(extractionKey);
        
        if (!existingData && typeof DocumentParser !== 'undefined') {
            try {
                // Create a file-like object from stored data
                const fileDataKey = `taxmind_file_data_${fileId}`;
                const base64Data = localStorage.getItem(fileDataKey);
                
                if (base64Data) {
                    // Convert base64 back to blob
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: file.type });
                    
                    // Create File object
                    const fileObj = new File([blob], file.name, { type: file.type });
                    
                    // Extract data with error handling
                    const result = await DocumentParser.extractFinancialData(fileObj, fileId);
                    if (result && !result.error && (result.income || result.wages)) {
                        console.log(`Successfully extracted data from ${file.name} for filing`);
                    } else if (result && result.error) {
                        console.warn(`Extraction failed for ${file.name}: ${result.errorMessage || 'Unknown error'}`);
                    } else {
                        console.log(`No financial data found in ${file.name}`);
                    }
                }
            } catch (error) {
                console.error(`Error extracting data from ${file.name}:`, error);
            }
        }
    }
}

function setupFormValidation() {
    const form = document.getElementById('filingForm');
    const filingButton = document.getElementById('filingButton');
    
    if (!form) {
        console.error('Filing form not found');
        return;
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            startFilingProcess();
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // SSN formatting
    const ssnInput = document.getElementById('ssn');
    if (ssnInput) {
        ssnInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 9) {
            value = value.substring(0, 9);
        }
        if (value.length >= 6) {
            value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
        } else if (value.length >= 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        this.value = value;
        });
    }
    
    // Bank account formatting
    const bankAccountInput = document.getElementById('bankAccount');
    if (bankAccountInput) {
        bankAccountInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        });
    }
    
    // Routing number formatting
    const routingInput = document.getElementById('routingNumber');
    if (routingInput) {
        routingInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 9) {
            this.value = this.value.substring(0, 9);
        }
        });
    }
    
    // Spouse SSN formatting
    const spouseSSNInput = document.getElementById('spouseSSN');
    if (spouseSSNInput) {
        spouseSSNInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 9) {
                value = value.substring(0, 9);
            }
            if (value.length >= 6) {
                value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
            } else if (value.length >= 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
            this.value = value;
        });
    }
    
    // Identity PIN formatting
    const identityPinInput = document.getElementById('identityPin');
    if (identityPinInput) {
        identityPinInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 6);
        });
    }
    
    // Show/hide spouse section based on filing status
    const filingStatusSelect = document.getElementById('filingStatus');
    if (filingStatusSelect) {
        filingStatusSelect.addEventListener('change', function() {
            const spouseSection = document.getElementById('spouseInfoSection');
            if (this.value === 'married') {
                spouseSection.style.display = 'block';
                // Make spouse fields required
                document.getElementById('spouseFirstName').required = true;
                document.getElementById('spouseLastName').required = true;
                document.getElementById('spouseSSN').required = true;
                document.getElementById('spouseBirthDate').required = true;
            } else {
                spouseSection.style.display = 'none';
                // Remove required attribute
                document.getElementById('spouseFirstName').required = false;
                document.getElementById('spouseLastName').required = false;
                document.getElementById('spouseSSN').required = false;
                document.getElementById('spouseBirthDate').required = false;
            }
        });
    }
}

// Toggle dependents section
function toggleDependentsSection() {
    const numDependents = parseInt(document.getElementById('numberOfDependents').value);
    const dependentsSection = document.getElementById('dependentsSection');
    const dependentsList = document.getElementById('dependentsList');
    
    if (numDependents > 0) {
        dependentsSection.style.display = 'block';
        dependentsList.innerHTML = '';
        
        const actualCount = numDependents === 5 ? 5 : numDependents;
        
        for (let i = 0; i < actualCount; i++) {
            const dependentDiv = document.createElement('div');
            dependentDiv.className = 'dependent-item';
            dependentDiv.style.cssText = 'background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #e2e8f0;';
            dependentDiv.innerHTML = `
                <h5 style="margin: 0 0 1rem; color: #1e293b;">Dependent ${i + 1}</h5>
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" name="dependentFirstName${i}" placeholder="First name" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" name="dependentLastName${i}" placeholder="Last name" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Social Security Number</label>
                        <input type="text" name="dependentSSN${i}" placeholder="XXX-XX-XXXX" required class="dependent-ssn">
                    </div>
                    <div class="form-group">
                        <label>Relationship to You</label>
                        <select name="dependentRelationship${i}" required>
                            <option value="">Select relationship</option>
                            <option value="son">Son</option>
                            <option value="daughter">Daughter</option>
                            <option value="stepson">Stepson</option>
                            <option value="stepdaughter">Stepdaughter</option>
                            <option value="foster">Foster Child</option>
                            <option value="brother">Brother</option>
                            <option value="sister">Sister</option>
                            <option value="parent">Parent</option>
                            <option value="other">Other Qualifying Relative</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dependentBirthDate${i}" required>
                </div>
            `;
            dependentsList.appendChild(dependentDiv);
            
            // Add SSN formatting to the new input
            const ssnInput = dependentDiv.querySelector('.dependent-ssn');
            ssnInput.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 9) {
                    value = value.substring(0, 9);
                }
                if (value.length >= 6) {
                    value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
                } else if (value.length >= 3) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                this.value = value;
            });
        }
        
        // Add dependent care expenses section
        const careExpensesDiv = document.createElement('div');
        careExpensesDiv.style.cssText = 'background: #f0f9ff; padding: 1.5rem; border-radius: 8px; margin-top: 1rem; border: 1px solid #bfdbfe;';
        careExpensesDiv.innerHTML = `
            <h5 style="margin: 0 0 1rem; color: #1e40af;">Dependent Care Expenses (Form 2441)</h5>
            <div class="form-group">
                <label>Total Dependent Care Expenses</label>
                <input type="text" name="dependentCareExpenses" placeholder="$0.00" id="dependentCareExpenses">
                <small style="color: #64748b; font-size: 0.85rem; display: block; margin-top: 0.25rem;">Enter total amount paid for childcare or dependent care services.</small>
            </div>
        `;
        dependentsList.appendChild(careExpensesDiv);
        
        // Format dependent care expenses input
        const careExpensesInput = document.getElementById('dependentCareExpenses');
        if (careExpensesInput) {
            careExpensesInput.addEventListener('input', function() {
                let value = this.value.replace(/[^0-9.]/g, '');
                if (value) {
                    value = '$' + parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                this.value = value;
            });
        }
    } else {
        dependentsSection.style.display = 'none';
    }
}

function validateForm() {
    const form = document.getElementById('filingForm');
    const formData = new FormData(form);
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
    document.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('error');
    });
    
    // Validate SSN
    const ssn = formData.get('ssn');
    if (!ssn || ssn.length !== 11) {
        showFieldError('ssn', 'Please enter a valid Social Security Number');
        isValid = false;
    }
    
    // Validate birth date
    const birthDate = formData.get('birthDate');
    if (!birthDate) {
        showFieldError('birthDate', 'Please enter your date of birth');
        isValid = false;
    }
    
    // Validate filing status
    const filingStatus = formData.get('filingStatus');
    if (!filingStatus) {
        showFieldError('filingStatus', 'Please select your filing status');
        isValid = false;
    }
    
    // Validate refund method
    const refundMethod = formData.get('refundMethod');
    if (!refundMethod) {
        showFieldError('refundMethod', 'Please select your refund method');
        isValid = false;
    }
    
    // Validate spouse information if married filing jointly
    const filingStatus = formData.get('filingStatus');
    if (filingStatus === 'married') {
        const spouseFirstName = formData.get('spouseFirstName');
        const spouseLastName = formData.get('spouseLastName');
        const spouseSSN = formData.get('spouseSSN');
        const spouseBirthDate = formData.get('spouseBirthDate');
        
        if (!spouseFirstName || !spouseLastName) {
            showFieldError('spouseFirstName', 'Spouse name is required for married filing jointly');
            isValid = false;
        }
        
        if (!spouseSSN || spouseSSN.length !== 11) {
            showFieldError('spouseSSN', 'Spouse SSN is required and must be in XXX-XX-XXXX format');
            isValid = false;
        }
        
        if (!spouseBirthDate) {
            showFieldError('spouseBirthDate', 'Spouse date of birth is required');
            isValid = false;
        }
    }
    
    // Validate dependents
    const numDependents = parseInt(formData.get('numberOfDependents') || '0');
    if (numDependents > 0) {
        const actualCount = numDependents === 5 ? 5 : numDependents;
        for (let i = 0; i < actualCount; i++) {
            const depFirstName = formData.get(`dependentFirstName${i}`);
            const depLastName = formData.get(`dependentLastName${i}`);
            const depSSN = formData.get(`dependentSSN${i}`);
            const depRelationship = formData.get(`dependentRelationship${i}`);
            const depBirthDate = formData.get(`dependentBirthDate${i}`);
            
            if (!depFirstName || !depLastName) {
                showFieldError(`dependentFirstName${i}`, `Dependent ${i + 1} name is required`);
                isValid = false;
            }
            
            if (!depSSN || depSSN.length !== 11) {
                showFieldError(`dependentSSN${i}`, `Dependent ${i + 1} SSN is required`);
                isValid = false;
            }
            
            if (!depRelationship) {
                showFieldError(`dependentRelationship${i}`, `Dependent ${i + 1} relationship is required`);
                isValid = false;
            }
            
            if (!depBirthDate) {
                showFieldError(`dependentBirthDate${i}`, `Dependent ${i + 1} date of birth is required`);
                isValid = false;
            }
        }
    }
    
    // Validate bank account if direct deposit selected
    if (refundMethod === 'direct') {
        const accountType = formData.get('accountType');
        const accountHolderName = formData.get('accountHolderName');
        const bankAccount = formData.get('bankAccount');
        const routingNumber = formData.get('routingNumber');
        
        if (!accountType) {
            showFieldError('accountType', 'Please select account type (checking or savings)');
            isValid = false;
        }
        
        if (!accountHolderName || accountHolderName.trim().length < 2) {
            showFieldError('accountHolderName', 'Please enter account holder name');
            isValid = false;
        }
        
        if (!bankAccount || bankAccount.length < 4) {
            showFieldError('bankAccount', 'Please enter a valid bank account number (at least 4 digits)');
            isValid = false;
        }
        
        if (!routingNumber || routingNumber.length !== 9) {
            showFieldError('routingNumber', 'Please enter a valid 9-digit routing number');
            isValid = false;
        } else {
            // Validate routing number checksum (simplified - first two digits should be valid)
            const routingDigits = routingNumber.replace(/\D/g, '');
            if (routingDigits.length === 9) {
                // Basic validation: routing number should not start with 00
                if (routingDigits.startsWith('00')) {
                    showFieldError('routingNumber', 'Invalid routing number format');
                    isValid = false;
                }
            }
        }
    }
    
    // Validate prior year AGI format (if provided)
    const priorYearAGI = formData.get('priorYearAGI');
    if (priorYearAGI) {
        const agiValue = priorYearAGI.replace(/[^0-9.]/g, '');
        if (agiValue && (isNaN(agiValue) || parseFloat(agiValue) < 0)) {
            showFieldError('priorYearAGI', 'Please enter a valid prior year AGI amount');
            isValid = false;
        }
    }
    
    // Validate Identity PIN format (if provided)
    const identityPin = formData.get('identityPin');
    if (identityPin) {
        const pinDigits = identityPin.replace(/\D/g, '');
        if (pinDigits.length !== 6) {
            showFieldError('identityPin', 'Identity Protection PIN must be 6 digits');
            isValid = false;
        }
    }
    
    // Validate checkboxes
    const agreeTerms = formData.get('agreeTerms');
    const electronicSignature = formData.get('electronicSignature');
    
    if (!agreeTerms) {
        showFieldError('agreeTerms', 'You must agree to the terms of service');
        isValid = false;
    }
    
    if (!electronicSignature) {
        showFieldError('electronicSignature', 'You must authorize electronic filing');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    
    // Clear previous error
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
    
    // Validate based on field type
    switch (field.name) {
        case 'ssn':
            if (value && value.length !== 11) {
                showFieldError(field.name, 'Please enter a valid Social Security Number');
            }
            break;
        case 'birthDate':
            if (value) {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 16 || age > 120) {
                    showFieldError(field.name, 'Please enter a valid date of birth');
                }
            }
            break;
        case 'bankAccount':
            if (value && value.length < 4) {
                showFieldError(field.name, 'Bank account number must be at least 4 digits');
            }
            break;
        case 'routingNumber':
            if (value && value.length !== 9) {
                showFieldError(field.name, 'Routing number must be exactly 9 digits');
            }
            break;
        case 'spouseSSN':
            if (value && value.length !== 11) {
                showFieldError(field.name, 'Spouse SSN must be in XXX-XX-XXXX format');
            }
            break;
        case 'identityPin':
            if (value && value.length !== 6) {
                showFieldError(field.name, 'Identity Protection PIN must be 6 digits');
            }
            break;
        case 'accountHolderName':
            if (value && value.trim().length < 2) {
                showFieldError(field.name, 'Account holder name must be at least 2 characters');
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.classList.add('error');
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorMessage.textContent = message;
        
        field.parentNode.appendChild(errorMessage);
    }
}

function startFilingProcess() {
    const filingButton = document.getElementById('filingButton');
    
    // Disable button and show loading
    filingButton.disabled = true;
    filingButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Filing Taxes...';
    
    // Simulate filing process
    simulateFilingProcess();
}

function simulateFilingProcess() {
    const steps = document.querySelectorAll('.filing-step');
    let currentStep = 1;
    
    const processSteps = [
        { step: 2, text: 'Verifying identity...' },
        { step: 3, text: 'Performing security check...' },
        { step: 4, text: 'Submitting to IRS...' }
    ];
    
    const interval = setInterval(() => {
        if (currentStep < processSteps.length) {
            const stepData = processSteps[currentStep];
            updateFilingStep(stepData.step, stepData.text);
            currentStep++;
        } else {
            clearInterval(interval);
            completeFiling();
        }
    }, 2000);
}

function updateFilingStep(stepNumber, text) {
    // Update progress text
    const filingButton = document.getElementById('filingButton');
    filingButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    
    // Update step status
    const step = document.getElementById(`step${stepNumber}`);
    const status = step.querySelector('.step-status');
    
    step.classList.remove('pending');
    step.classList.add('active');
    status.className = 'step-status status-active';
    status.textContent = 'In Progress';
    
    // Mark previous step as completed
    if (stepNumber > 1) {
        const prevStep = document.getElementById(`step${stepNumber - 1}`);
        const prevStatus = prevStep.querySelector('.step-status');
        
        prevStep.classList.remove('active');
        prevStep.classList.add('completed');
        prevStatus.className = 'step-status status-completed';
        prevStatus.textContent = 'Completed';
    }
}

function completeFiling() {
    // Hide form and show success message
    document.getElementById('filingForm').style.display = 'none';
    document.getElementById('filingSuccess').style.display = 'block';
    
    // Generate confirmation number
    const confirmationNumber = 'TM-' + new Date().getFullYear() + '-' + Math.random().toString().substr(2, 9);
    document.getElementById('confirmationNumber').textContent = confirmationNumber;
    
    // Mark filing as completed
    localStorage.setItem('taxmind_taxes_filed', 'true');
    localStorage.setItem('taxmind_filing_date', new Date().toISOString());
    localStorage.setItem('taxmind_confirmation_number', confirmationNumber);
    
    // Update final step
    const finalStep = document.getElementById('step4');
    const finalStatus = finalStep.querySelector('.step-status');
    
    finalStep.classList.remove('active');
    finalStep.classList.add('completed');
    finalStatus.className = 'step-status status-completed';
    finalStatus.textContent = 'Completed';
    
    // Show success notification
    showNotification('Taxes filed successfully!', 'success');
    
    // Scroll to success message
    document.getElementById('filingSuccess').scrollIntoView({ behavior: 'smooth' });
}

function checkFilingStatus() {
    const taxesFiled = localStorage.getItem('taxmind_taxes_filed') === 'true';
    
    if (taxesFiled) {
        // Show already filed message
        showAlreadyFiledMessage();
    }
}

function showAlreadyFiledMessage() {
    const filingForm = document.getElementById('filingForm');
    const filingSuccess = document.getElementById('filingSuccess');
    
    filingForm.style.display = 'none';
    filingSuccess.style.display = 'block';
    
    // Update confirmation number
    const confirmationNumber = localStorage.getItem('taxmind_confirmation_number');
    if (confirmationNumber) {
        document.getElementById('confirmationNumber').textContent = confirmationNumber;
    }
    
    // Update success message
    document.querySelector('.success-title').textContent = 'Taxes Already Filed!';
    document.querySelector('.success-description').textContent = 'Your tax return has already been submitted to the IRS.';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
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
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
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
    // Ctrl/Cmd + S for submit
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const form = document.getElementById('filingForm');
        if (form && !document.getElementById('filingButton').disabled) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});
















