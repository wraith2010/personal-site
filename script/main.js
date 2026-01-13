// ====================================
// DARK PORTFOLIO - MAIN JAVASCRIPT
// ====================================

(function() {
    'use strict';

    // ====================================
    // SMOOTH SCROLL ENHANCEMENT
    // ====================================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ====================================
    // HEADER SCROLL EFFECT
    // ====================================
    
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > scrollThreshold) {
                header.style.background = 'rgba(10, 14, 23, 0.95)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
            } else {
                header.style.background = 'linear-gradient(180deg, var(--color-bg-secondary) 0%, transparent 100%)';
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }

    // ====================================
    // IMAGE GALLERY LIGHTBOX
    // ====================================
    
    function initGalleryLightbox() {
        const galleries = document.querySelectorAll('.gallery');
        
        galleries.forEach(gallery => {
            const images = gallery.querySelectorAll('img');
            
            images.forEach((img, index) => {
                img.addEventListener('click', () => {
                    createLightbox(gallery, index);
                });
            });
        });
    }

    function createLightbox(gallery, startIndex) {
        const images = Array.from(gallery.querySelectorAll('img'));
        let currentIndex = startIndex;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                <button class="lightbox-prev" aria-label="Previous image">‹</button>
                <img src="${images[currentIndex].src}" alt="${images[currentIndex].alt}">
                <button class="lightbox-next" aria-label="Next image">›</button>
                <div class="lightbox-counter">${currentIndex + 1} / ${images.length}</div>
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        // Animation
        requestAnimationFrame(() => {
            lightbox.style.opacity = '1';
        });

        const lightboxImg = lightbox.querySelector('img');
        const counter = lightbox.querySelector('.lightbox-counter');

        function updateImage() {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = images[currentIndex].src;
                lightboxImg.alt = images[currentIndex].alt;
                counter.textContent = `${currentIndex + 1} / ${images.length}`;
                lightboxImg.style.opacity = '1';
            }, 150);
        }

        // Close lightbox
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);

        // Navigation
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        });

        lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        });

        // Keyboard navigation
        function handleKeyPress(e) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateImage();
            }
            if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                updateImage();
            }
        }

        document.addEventListener('keydown', handleKeyPress);

        function closeLightbox() {
            lightbox.style.opacity = '0';
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyPress);
            setTimeout(() => {
                lightbox.remove();
            }, 300);
        }
    }

    // ====================================
    // SCROLL REVEAL ANIMATION
    // ====================================
    
    function initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.project-card');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ====================================
    // ACTIVE LINK HIGHLIGHTING
    // ====================================
    
    function initActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.main-nav a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ====================================
    // LAZY LOADING IMAGES
    // ====================================
    
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ====================================
    // PERFORMANCE: DEBOUNCE UTILITY
    // ====================================
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ====================================
    // ADD LIGHTBOX STYLES DYNAMICALLY
    // ====================================
    
    function addLightboxStyles() {
        const styles = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .lightbox-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
            }

            .lightbox-content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 60px 20px 20px;
            }

            .lightbox-content img {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                transition: opacity 0.15s ease;
            }

            .lightbox-close,
            .lightbox-prev,
            .lightbox-next {
                position: absolute;
                background: rgba(1, 186, 239, 0.9);
                border: none;
                color: white;
                font-size: 2rem;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 8px;
                z-index: 10000;
            }

            .lightbox-close:hover,
            .lightbox-prev:hover,
            .lightbox-next:hover {
                background: rgba(1, 186, 239, 1);
                transform: scale(1.1);
            }

            .lightbox-close {
                top: 20px;
                right: 20px;
                font-size: 2.5rem;
                line-height: 1;
            }

            .lightbox-prev {
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
            }

            .lightbox-prev:hover {
                transform: translateY(-50%) scale(1.1);
            }

            .lightbox-next {
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
            }

            .lightbox-next:hover {
                transform: translateY(-50%) scale(1.1);
            }

            .lightbox-counter {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .lightbox-prev,
                .lightbox-next {
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                }

                .lightbox-close {
                    width: 40px;
                    height: 40px;
                }

                .lightbox-prev {
                    left: 10px;
                }

                .lightbox-next {
                    right: 10px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // ====================================
    // INITIALIZE ON DOM READY
    // ====================================
    
    function init() {
        initSmoothScroll();
        initHeaderScroll();
        initGalleryLightbox();
        initScrollReveal();
        initActiveLink();
        initLazyLoading();
        addLightboxStyles();
    }

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ====================================
    // PERFORMANCE MONITORING (Optional)
    // ====================================
    
    if (window.console && console.log) {
        console.log('%c🎨 Dark Portfolio Theme Loaded', 
            'color: #01baef; font-size: 16px; font-weight: bold;');
    }

})();
