/**
 * Simple Gallery System for High Voltage Website
 * Automatically detects and displays images from current folder
 * No XML configuration required
 */

class SimpleGallery {
    constructor(options = {}) {
        this.folderName = this.getCurrentFolderName();
        this.title = options.title || this.folderName;
        this.images = [];
        this.currentIndex = 0;
        
        this.init();
    }
    
    getCurrentFolderName() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part.length > 0);
        return pathParts[pathParts.length - 2] || 'Galéria'; // Get parent folder name
    }
    
    async init() {
        try {
            await this.discoverImages();
            this.createGalleryHTML();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize gallery:', error);
            this.showError('Hiba a galéria betöltése közben.');
        }
    }
    
    async discoverImages() {
        try {
            // First try to load from gallery.xml in current directory
            const response = await fetch('./gallery.xml');
            if (response.ok) {
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                
                // Parse gallery attributes
                const galleryElement = xmlDoc.querySelector('simpleviewergallery');
                if (galleryElement) {
                    this.title = galleryElement.getAttribute('title') || this.title;
                }
                
                // Parse images from XML
                const imageElements = xmlDoc.querySelectorAll('image');
                this.images = Array.from(imageElements).map(img => {
                    const filename = img.querySelector('filename').textContent;
                    const caption = img.querySelector('caption').textContent || '';
                    
                    return {
                        filename: filename,
                        caption: caption,
                        thumbSrc: `./thumbs/${filename}`,
                        fullSrc: `./images/${filename}`
                    };
                });
                
                // Check if thumb directory works, if not fall back to images for thumbnails
                if (this.images.length > 0) {
                    const testThumb = this.images[0];
                    try {
                        const thumbResponse = await fetch(testThumb.thumbSrc, { method: 'HEAD' });
                        if (!thumbResponse.ok) {
                            // Use images directory for both thumb and full
                            this.images = this.images.map(img => ({
                                ...img,
                                thumbSrc: `./images/${img.filename}`,
                                fullSrc: `./images/${img.filename}`
                            }));
                        }
                    } catch (e) {
                        // Fallback to images directory
                        this.images = this.images.map(img => ({
                            ...img,
                            thumbSrc: `./images/${img.filename}`,
                            fullSrc: `./images/${img.filename}`
                        }));
                    }
                }
                
                return; // Successfully loaded from XML
            }
        } catch (error) {
            console.log('Could not load from XML, trying alternative method:', error);
        }
        
        // Fallback: try to discover images by testing common filenames
        await this.fallbackImageDiscovery();
        
        if (this.images.length === 0) {
            throw new Error('Nem találhatók képek ebben a mappában');
        }
    }
    
    async fallbackImageDiscovery() {
        // Common filename patterns for galleries
        const patterns = [
            // Pattern for numbered files
            { prefix: 'tn_P', start: 1010066, end: 1010150, ext: 'JPG' },
            { prefix: 'large', start: 1, end: 50, ext: 'jpg', format: '00000' },
            { prefix: '', start: 1, end: 100, ext: 'jpg' },
            { prefix: 'img', start: 1, end: 100, ext: 'jpg' },
        ];
        
        for (const pattern of patterns) {
            const discoveredImages = [];
            
            for (let i = pattern.start; i <= pattern.end; i++) {
                let filename;
                if (pattern.format) {
                    const num = i.toString().padStart(pattern.format.length, '0');
                    filename = `${pattern.prefix}${num}.${pattern.ext}`;
                } else {
                    filename = `${pattern.prefix}${i}.${pattern.ext}`;
                }
                
                try {
                    // Test if file exists in images directory
                    const testResponse = await fetch(`./images/${filename}`, { method: 'HEAD' });
                    if (testResponse.ok) {
                        discoveredImages.push({
                            filename: filename,
                            caption: '',
                            thumbSrc: `./thumbs/${filename}`,
                            fullSrc: `./images/${filename}`
                        });
                    }
                } catch (e) {
                    // File doesn't exist, continue
                }
                
                // Don't test too many files at once
                if (discoveredImages.length >= 50) break;
            }
            
            if (discoveredImages.length > 0) {
                this.images = discoveredImages;
                return;
            }
        }
    }
    
    createGalleryHTML() {
        const body = document.body;
        body.innerHTML = `
            <div class="simple-gallery">
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
                            <img src="${img.thumbSrc}" alt="${img.caption || `Kép ${index + 1}`}" 
                                 loading="lazy" 
                                 onerror="this.src='${img.fullSrc}'">
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
        
        this.container = document.querySelector('.simple-gallery');
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
        this.modalCaption.textContent = img.caption || `Kép ${index + 1}`;
        this.modalCounter.textContent = `${index + 1} / ${this.images.length}`;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Handle image load error - try thumb if full image fails
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
                <p>Mappa: ${this.folderName}</p>
                <a href="../03.html">← Vissza a galériákhoz</a>
            </div>
        `;
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleGallery();
});