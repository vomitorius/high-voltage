/**
 * Modern Gallery System for High Voltage Website
 * Replaces Flash-based SimpleViewer galleries
 */

class ModernGallery {
    constructor(options = {}) {
        this.xmlPath = options.xmlPath || 'gallery.xml';
        this.imagePath = options.imagePath || 'images/';
        this.thumbPath = options.thumbPath || 'thumbs/';
        this.title = options.title || '';
        this.container = null;
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
            this.showError('Hiba a galéria betöltése közben.');
        }
    }
    
    async loadGalleryData() {
        try {
            const response = await fetch(this.xmlPath);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Parse gallery attributes
            const galleryElement = xmlDoc.querySelector('simpleviewergallery');
            if (galleryElement) {
                this.title = galleryElement.getAttribute('title') || this.title;
                this.imagePath = galleryElement.getAttribute('imagePath') || this.imagePath;
                this.thumbPath = galleryElement.getAttribute('thumbPath') || this.thumbPath;
            }
            
            // Parse images
            const imageElements = xmlDoc.querySelectorAll('image');
            this.images = Array.from(imageElements).map(img => {
                const filename = img.querySelector('filename').textContent;
                const caption = img.querySelector('caption').textContent || '';
                
                return {
                    filename: filename,
                    caption: caption,
                    thumbSrc: this.thumbPath + filename,
                    fullSrc: this.imagePath + filename
                };
            });
            
        } catch (error) {
            throw new Error('Nem sikerült betölteni a gallery.xml fájlt: ' + error.message);
        }
    }
    
    createGalleryHTML() {
        const body = document.body;
        body.innerHTML = `
            <div class="modern-gallery">
                <header class="gallery-header">
                    <h1>${this.title}</h1>
                    <a href="../03.html" class="back-btn">← Vissza a képekhez</a>
                </header>
                
                <div class="gallery-grid" id="gallery-grid">
                    ${this.images.map((img, index) => `
                        <div class="gallery-item" data-index="${index}">
                            <img src="${img.thumbSrc}" alt="${img.caption}" loading="lazy" 
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2VwIG5lbSB0YWxhbGhhdMOzPC90ZXh0Pjwvc3ZnPg=='">
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
        
        this.container = document.querySelector('.modern-gallery');
        this.modal = document.getElementById('gallery-modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalCaption = document.getElementById('modal-caption');
        this.modalCounter = document.getElementById('modal-counter');
    }
    
    bindEvents() {
        // Thumbnail clicks
        const thumbnails = document.querySelectorAll('.gallery-item');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.openModal(index));
        });
        
        // Modal events
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-prev').addEventListener('click', () => this.prevImage());
        document.querySelector('.modal-next').addEventListener('click', () => this.nextImage());
        
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
        this.modalCaption.textContent = img.caption;
        this.modalCounter.textContent = `${index + 1} / ${this.images.length}`;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Handle image load error
        this.modalImage.onerror = () => {
            this.modalImage.src = img.thumbSrc;
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
                <a href="../03.html">← Vissza a képekhez</a>
            </div>
        `;
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ModernGallery();
});