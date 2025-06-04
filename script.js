function initMainPage() {
        // Start countdown timer
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Initialize scroll effects
        handleHeaderScroll();
        handleScrollAnimations();
        
        // Initialize smooth scroll
        initSmoothScroll();

        // Add hover effects to cards
        addCardHoverEffects();

        // Log initialization
        console.log('NORX Company Landing Page Loaded Successfully! 🚀');
        console.log('Entry animation completed. Main content visible.');
    }

    // Countdown Timer
    function updateCountdown() {
        const targetDate = new Date('2025-06-10T14:00:00Z').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('countdown').innerHTML = 
                '<div style="font-size: 24px; color: #4CAF50; font-weight: 900;">🚀 NORXCOIN LANÇADO!</div>';
        }
    }

    // Scroll Animations
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function handleScrollAnimations() {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(element => {
            if (isInViewport(element) || element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('visible');
            }
        });
    }

    // Smooth Scroll
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Header scroll effect
    function handleHeaderScroll() {
        window.addEventListener('scroll', () => {
            if (!entryAnimationCompleted) return;
            
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.95)';
            }
            
            handleScrollAnimations();
        });
    }

    // Add hover effects to cards
    function addCardHoverEffects() {
        const cards = document.querySelectorAll('.service-card, .token-card, .step-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#D4AF37'};
            color: ${type === 'success' ? 'white' : '#000'};
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Performance monitoring
    function trackPerformance() {
        const stats = {
            totalUsers: 247,
            winRate: 93.0,
            trades: 57,
            wins: 53,
            losses: 4,
            monthlyClients: 19,
            investmentReturn: 13.89
        };
        
        console.log('NORX Performance Stats:', stats);
        return stats;
    }

    // Initialize everything when DOM is loaded
    function init() {
        // Initialize entry screen
        initEntryScreen();
        
        // Track performance
        trackPerformance();
        
        console.log('NORX Company - Entry screen initialized');
        console.log('Click "ENTRAR" to begin the epic animation sequence!');
    }

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', init);

    // Additional utility functions
    const utils = {
        // Format numbers with commas
        formatNumber: function(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },

        // Validate email format
        validateEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        // Get current timestamp
        getCurrentTimestamp: function() {
            return new Date().toISOString();
        },

        // Scroll to top
        scrollToTop: function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },

        // Check if user is on mobile
        isMobile: function() {
            return window.innerWidth <= 768;
        },

        // Calculate investment returns
        calculateROI: function(investment, returns) {
            return ((returns - investment) / investment * 100).toFixed(2);
        },

        // Generate random particle positions
        generateParticlePosition: function() {
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 4 + 2,
                speed: Math.random() * 2 + 1
            };
        }
    };

    // Expose utils globally
    window.norxUtils = utils;

    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        konamiCode = konamiCode.slice(-konamiSequence.length);
        
        if (konamiCode.join('') === konamiSequence.join('')) {
            showNotification('🚀 Código Konami ativado! Easter egg desbloqueado!', 'success');
            // Add special effects
            document.body.style.animation = 'rainbow 2s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
        }
    });

    // Add rainbow animation for easter egg
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);