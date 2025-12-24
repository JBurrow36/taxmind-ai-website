// PDF Document Viewer with Highlight Overlays
// Integrates with PDF.js for rendering and highlight-engine.js for annotations

const DocumentViewer = {
    pdfDoc: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    highlights: [],
    renderTask: null,
    
    // Initialize the viewer
    init: function() {
        // Configure PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Get document info from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId') || localStorage.getItem('taxmind_viewing_file_id');
        
        if (fileId) {
            this.loadDocument(fileId);
        } else {
            console.error('No file ID provided');
            this.showError('No document selected');
        }
    },
    
    // Load PDF document
    loadDocument: async function(fileId) {
        try {
            // Get file data from localStorage
            const uploadedFiles = JSON.parse(localStorage.getItem('taxmind_uploaded_files') || '{}');
            const file = uploadedFiles[fileId];
            
            if (!file) {
                this.showError('Document not found');
                return;
            }
            
            // Update document name
            document.getElementById('viewer-document-name').textContent = file.name;
            
            // Load highlights if available
            const allHighlights = JSON.parse(localStorage.getItem('taxmind_document_highlights') || '{}');
            const highlights = allHighlights[fileId] || [];
            this.loadHighlights(highlights);
            
            // Load PDF from file data
            // Note: In a real application, you'd load the actual PDF file from server
            // For now, we'll show a message indicating file loading
            this.showMessage('PDF viewer ready. In production, files would be loaded from server storage. Highlights are displayed in the sidebar.');
            
            // Simulate document structure for highlights display
            // In real implementation, you'd load the actual PDF:
            // const fileUrl = `/api/files/${fileId}`;
            // const loadingTask = pdfjsLib.getDocument(fileUrl);
            // this.pdfDoc = await loadingTask.promise;
            // this.totalPages = this.pdfDoc.numPages;
            // this.renderPage(this.currentPage);
            
        } catch (error) {
            console.error('Error loading document:', error);
            this.showError('Failed to load document: ' + error.message);
        }
    },
    
    // Render a page
    renderPage: async function(pageNum) {
        if (!this.pdfDoc) return;
        
        try {
            this.currentPage = pageNum;
            
            // Cancel previous render task
            if (this.renderTask) {
                this.renderTask.cancel();
            }
            
            // Get page
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            // Create canvas
            const container = document.getElementById('pdf-container');
            container.innerHTML = '';
            
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page';
            pageDiv.style.width = viewport.width + 'px';
            pageDiv.style.height = viewport.height + 'px';
            pageDiv.style.position = 'relative';
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            this.renderTask = page.render(renderContext);
            await this.renderTask.promise;
            
            pageDiv.appendChild(canvas);
            
            // Add highlight overlays for this page
            this.addHighlightOverlays(pageDiv, pageNum, viewport);
            
            container.appendChild(pageDiv);
            
            // Update page info
            document.getElementById('page-info').textContent = `Page ${pageNum} of ${this.totalPages}`;
            
            // Update navigation buttons
            document.getElementById('prev-page').disabled = pageNum <= 1;
            document.getElementById('next-page').disabled = pageNum >= this.totalPages;
            
        } catch (error) {
            console.error('Error rendering page:', error);
            if (error.name !== 'RenderingCancelledException') {
                this.showError('Failed to render page: ' + error.message);
            }
        }
    },
    
    // Add highlight overlays to a page
    addHighlightOverlays: function(pageDiv, pageNum, viewport) {
        // Filter highlights for this page
        const pageHighlights = this.highlights.filter(h => h.page === pageNum);
        
        if (pageHighlights.length === 0) return;
        
        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'highlight-overlay';
        overlayDiv.style.position = 'absolute';
        overlayDiv.style.top = '0';
        overlayDiv.style.left = '0';
        overlayDiv.style.width = '100%';
        overlayDiv.style.height = '100%';
        overlayDiv.style.pointerEvents = 'none';
        
        pageHighlights.forEach(highlight => {
            const highlightBox = document.createElement('div');
            highlightBox.className = `highlight-box highlight-${highlight.type}`;
            
            // Convert PDF coordinates to screen coordinates
            // This is simplified - real implementation would properly map coordinates
            const x = (highlight.bbox.x / viewport.width) * 100;
            const y = (highlight.bbox.y / viewport.height) * 100;
            const width = (highlight.bbox.width / viewport.width) * 100;
            const height = (highlight.bbox.height / viewport.height) * 100;
            
            highlightBox.style.left = x + '%';
            highlightBox.style.top = y + '%';
            highlightBox.style.width = width + '%';
            highlightBox.style.height = height + '%';
            highlightBox.title = highlight.message;
            
            // Make clickable
            highlightBox.style.pointerEvents = 'all';
            highlightBox.style.cursor = 'pointer';
            highlightBox.addEventListener('click', () => {
                this.showHighlightDetail(highlight);
            });
            
            overlayDiv.appendChild(highlightBox);
        });
        
        pageDiv.appendChild(overlayDiv);
    },
    
    // Show highlight detail
    showHighlightDetail: function(highlight) {
        // Scroll to highlight in sidebar
        const highlightElement = document.getElementById(`highlight-${highlight.id}`);
        if (highlightElement) {
            highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightElement.style.background = '#fff3cd';
            setTimeout(() => {
                highlightElement.style.background = '';
            }, 2000);
        }
    },
    
    // Previous page
    prevPage: function() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    },
    
    // Next page
    nextPage: function() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    },
    
    // Zoom in
    zoomIn: function() {
        this.scale = Math.min(this.scale + 0.25, 3.0);
        if (this.pdfDoc) {
            this.renderPage(this.currentPage);
        }
    },
    
    // Zoom out
    zoomOut: function() {
        this.scale = Math.max(this.scale - 0.25, 0.5);
        if (this.pdfDoc) {
            this.renderPage(this.currentPage);
        }
    },
    
    // Load highlights from highlight engine
    loadHighlights: function(highlights) {
        this.highlights = highlights;
        this.displayHighlightsList();
    },
    
    // Display highlights in sidebar
    displayHighlightsList: function() {
        const highlightsList = document.getElementById('highlights-list');
        if (!highlightsList) return;
        
        highlightsList.innerHTML = '';
        
        if (this.highlights.length === 0) {
            highlightsList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No highlights found</p>';
            return;
        }
        
        // Group by type
        const suggestions = this.highlights.filter(h => h.type === 'suggestion');
        const warnings = this.highlights.filter(h => h.type === 'warning');
        const redflags = this.highlights.filter(h => h.type === 'redflag');
        
        // Display red flags first
        redflags.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
        
        // Then warnings
        warnings.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
        
        // Then suggestions
        suggestions.forEach(highlight => {
            highlightsList.appendChild(this.createHighlightItem(highlight));
        });
    },
    
    // Create highlight item element
    createHighlightItem: function(highlight) {
        const item = document.createElement('div');
        item.className = `highlight-item ${highlight.type}`;
        item.id = `highlight-${highlight.id}`;
        
        item.innerHTML = `
            <div class="highlight-item-header">
                <span class="highlight-item-type ${highlight.type}">${this.getTypeLabel(highlight.type)}</span>
            </div>
            <div class="highlight-item-text">${highlight.message}</div>
            <div class="highlight-item-location">Page ${highlight.page}</div>
        `;
        
        item.addEventListener('click', () => {
            // Navigate to page and highlight
            if (highlight.page !== this.currentPage) {
                this.renderPage(highlight.page);
            }
            this.showHighlightDetail(highlight);
        });
        
        return item;
    },
    
    // Get type label
    getTypeLabel: function(type) {
        const labels = {
            'suggestion': 'Suggestion',
            'warning': 'Warning',
            'redflag': 'Red Flag'
        };
        return labels[type] || type;
    },
    
    // Show error message
    showError: function(message) {
        const container = document.getElementById('pdf-container');
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="color: #ef4444;">${message}</p>
                <a href="ai-analysis.html" class="viewer-btn" style="margin-top: 1rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Analysis
                </a>
            </div>
        `;
    },
    
    // Show message
    showMessage: function(message) {
        const container = document.getElementById('pdf-container');
        container.innerHTML = `
            <div class="loading">
                <p>${message}</p>
                <a href="ai-analysis.html" class="viewer-btn" style="margin-top: 1rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Analysis
                </a>
            </div>
        `;
    }
};

