/**
 * Simple Gallery Viewer for High Voltage Website
 * Reads gallery.xml and displays images from images/ and thumbs/ folders
 * Clean, simple implementation without complex fallback patterns
 * 
 * Note: Uses full-size images for thumbnails to improve quality,
 * falls back to thumbnail images if full-size fails to load
 */

class GalleryViewer {
    constructor() {
        this.title = '';
        this.images = [];
        this.currentIndex = 0;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadGalleryData();
            this.createGalleryHTML();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize gallery:', error);
            this.showError('Hiba a galéria betöltése közben: ' + error.message);
        }
    }
    
    async loadGalleryData() {
        try {
            const galleryPath = this.getGalleryBasePath();
            const response = await fetch(`${galleryPath}gallery.xml`);
            if (!response.ok) {
                throw new Error('Nem található gallery.xml fájl');
            }
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for XML parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Hiba a gallery.xml feldolgozásában');
            }
            
            // Parse gallery attributes
            const galleryElement = xmlDoc.querySelector('simpleviewergallery');
            if (!galleryElement) {
                throw new Error('Érvénytelen gallery.xml formátum');
            }
            
            this.title = galleryElement.getAttribute('title') || this.getFolderName();
            
            // Parse images
            const imageElements = xmlDoc.querySelectorAll('image');
            this.images = Array.from(imageElements).map(img => {
                const filenameElement = img.querySelector('filename');
                const captionElement = img.querySelector('caption');
                
                if (!filenameElement) {
                    return null;
                }
                
                const filename = filenameElement.textContent.trim();
                const caption = captionElement ? captionElement.textContent.trim() : '';
                
                const galleryPath = this.getGalleryBasePath();
                // Convert filename to match filesystem encoding (Latin-1 URL encoding for accents, spaces encoded)
                // The filesystem files have accents encoded as Latin-1 (%E9 for 'é') and spaces need to be %20
                const encodedFilename = filename.replace(/é/g, '%E9').replace(/ /g, '%20');
                return {
                    filename: filename,
                    caption: caption,
                    thumbSrc: `${galleryPath}images/${encodedFilename}`, // Use full-size image for better quality
                    thumbFallback: `${galleryPath}thumbs/${encodedFilename}`, // Fallback to thumbnail if full image fails
                    fullSrc: `${galleryPath}images/${encodedFilename}`
                };
            }).filter(img => img !== null);
            
            if (this.images.length === 0) {
                throw new Error('Nincsenek képek a gallery.xml fájlban');
            }
            
        } catch (error) {
            throw new Error('Nem sikerült betölteni a galéria adatokat: ' + error.message);
        }
    }
    
    getFolderName() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part.length > 0);
        return pathParts[pathParts.length - 1] || 'Galéria';
    }
    
    getGalleryBasePath() {
        // Get the current directory path for the gallery
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part.length > 0);
        
        // Remove the index.html if present and get the directory path
        if (pathParts.length > 0 && pathParts[pathParts.length - 1].includes('.html')) {
            pathParts.pop();
        }
        
        // Construct the base path for this gallery
        return pathParts.length > 0 ? `/${pathParts.join('/')}/` : '/';
    }
    
    createGalleryHTML() {
        const body = document.body;
        body.innerHTML = `
            <div class="gallery-viewer">
                <header class="gallery-header">
                    <h1>${this.title}</h1>
                    <a href="../03.html" class="back-btn">← Vissza a galériákhoz</a>
                </header>
                
                <div class="gallery-info">
                    <p>${this.images.length} kép található ebben a galériában</p>
                </div>
                
                <div class="gallery-grid" id="gallery-grid">
                    ${this.images.map((img, index) => `
                        <div class="gallery-item" data-index="${index}">
                            <img src="${img.thumbSrc}" 
                                 alt="${img.caption || `Kép ${index + 1}`}" 
                                 loading="lazy" 
                                 onerror="this.src='${img.thumbFallback}'; this.parentElement.classList.add('fallback')">
                            ${img.caption ? `<div class="caption">${img.caption}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Modal for fullsize images -->
            <div class="gallery-modal" id="gallery-modal">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <button class="modal-nav modal-prev">‹</button>
                    <button class="modal-nav modal-next">›</button>
                    <img src="" alt="" id="modal-image">
                    <div class="modal-info">
                        <div class="modal-caption" id="modal-caption"></div>
                        <div class="modal-counter" id="modal-counter"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.container = document.querySelector('.gallery-viewer');
        this.modal = document.getElementById('gallery-modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalCaption = document.getElementById('modal-caption');
        this.modalCounter = document.getElementById('modal-counter');
    }
    
    bindEvents() {
        // Thumbnail clicks
        const thumbnails = document.querySelectorAll('.gallery-item');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                if (!thumb.classList.contains('error')) {
                    this.openModal(index);
                }
            });
        });
        
        // Modal events
        const closeBtn = document.querySelector('.modal-close');
        const prevBtn = document.querySelector('.modal-prev');
        const nextBtn = document.querySelector('.modal-next');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevImage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());
        
        // Modal background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
        
        // Touch events for mobile
        let startX = 0;
        this.modalImage.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.modalImage.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextImage();
                } else {
                    this.prevImage();
                }
            }
        });
    }
    
    openModal(index) {
        this.currentIndex = index;
        const img = this.images[index];
        
        this.modalImage.src = img.fullSrc;
        this.modalCaption.textContent = img.caption || `Kép ${index + 1}`;
        this.modalCounter.textContent = `${index + 1} / ${this.images.length}`;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Handle image load error - fallback to thumbnail
        this.modalImage.onerror = () => {
            if (this.modalImage.src !== img.thumbSrc) {
                this.modalImage.src = img.thumbSrc;
            }
        };
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.openModal(this.currentIndex);
    }
    
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.openModal(this.currentIndex);
    }
    
    showError(message) {
        document.body.innerHTML = `
            <div class="gallery-error">
                <h2>Hiba</h2>
                <p>${message}</p>
                <p>Mappa: ${this.getFolderName()}</p>
                <a href="../03.html">← Vissza a galériákhoz</a>
            </div>
        `;
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GalleryViewer();
});