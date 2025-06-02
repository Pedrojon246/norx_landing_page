
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

        // Atualizar countdown a cada segundo
        updateCountdown();
        setInterval(updateCountdown, 1000);

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

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.95)';
            }
            
            handleScrollAnimations();
        });

        // Initial animation check
        handleScrollAnimations();

        // Mobile menu toggle (if needed)
        function toggleMobileMenu() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }

        // Copy contract address
        function copyContract() {
            const contractAddress = '0x9F8ace87A43851aCc21B6a00A84b4F9088563179';
            navigator.clipboard.writeText(contractAddress).then(() => {
                alert('Endereço do contrato copiado!');
            });
        }

        // Add click handlers for interactive elements
        document.addEventListener('DOMContentLoaded', function() {
            // Add any additional interactive functionality here
            console.log('NORX Company Landing Page Loaded');
        });
  