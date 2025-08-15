// Modern JavaScript for High Voltage Website

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
    
    // Lazy loading images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });
    
    // Image error handling - fallback images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Try alternative image paths or show placeholder
            const src = this.src;
            if (src.includes('_K.jpg') && !this.hasAttribute('data-fallback-tried')) {
                this.src = src.replace('_K.jpg', '.jpg');
                this.setAttribute('data-fallback-tried', 'true');
            } else if (src.includes('.jpg') && !this.hasAttribute('data-fallback-tried-png')) {
                this.src = src.replace('.jpg', '.png');
                this.setAttribute('data-fallback-tried-png', 'true');
            } else if (!this.hasAttribute('data-fallback-final')) {
                // Final fallback - hide the image or show a placeholder
                this.style.display = 'none';
                this.setAttribute('data-fallback-final', 'true');
                
                // Add a text placeholder if it's a concert poster
                if (this.closest('.concert-poster')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder';
                    placeholder.textContent = 'Kép nem elérhető';
                    placeholder.style.cssText = 'background: #333; color: #ccc; padding: 20px; text-align: center; border-radius: 8px;';
                    this.parentNode.appendChild(placeholder);
                }
            }
        });
    });
    
    // Add loading states for images
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0.5';
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });
    
    // Sidebar visibility on mobile
    function handleSidebarVisibility() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (window.innerWidth <= 768) {
                sidebar.style.position = 'static';
                sidebar.style.transform = 'none';
            } else {
                sidebar.style.position = 'fixed';
                sidebar.style.transform = 'translateY(-50%)';
            }
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', handleSidebarVisibility);
    handleSidebarVisibility(); // Call initially
    
    // Add some visual feedback for navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === 'index.html' && href === '#hirek') ||
            (currentPage === '' && href === '#hirek')) {
            link.classList.add('active');
        }
    });
    
    // Console message for developers
    console.log('%c🎸 High Voltage Website Loaded! 🎸', 
                'color: #dc143c; font-size: 16px; font-weight: bold;');
    console.log('AC/DC Tribute Band - Modernized for the web');
    
});

// Add some rock'n'roll easter eggs
document.addEventListener('keydown', function(e) {
    // Konami code or special key combinations could trigger effects
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
});

// CSS for shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
}
`;
document.head.appendChild(style);