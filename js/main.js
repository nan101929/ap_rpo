/**
 * FaceSwap AI Landing Page - Main JavaScript
 * Handles interactions, scroll behaviors, form validation, and OS detection
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // DOM Elements
    // ============================================
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    const stickyBar = document.getElementById('stickyBar');
    const registerForm = document.getElementById('registerForm');
    const osDetect = document.getElementById('osDetect');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // ============================================
    // Header Scroll Effect
    // ============================================
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class for header styling
        if (currentScroll > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Show/hide sticky bar after scrolling past hero
        const heroHeight = document.getElementById('hero').offsetHeight;
        if (currentScroll > heroHeight * 0.6) {
            stickyBar.classList.add('visible');
        } else {
            stickyBar.classList.remove('visible');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMobile.classList.toggle('active');
        document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMobile.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Track CTA click (placeholder for GA4)
                trackEvent('cta_click', { destination: href });
            }
        });
    });

    // ============================================
    // Form Validation & Submission
    // ============================================
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = true;

        // Reset errors
        email.classList.remove('error');
        password.classList.remove('error');

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            email.classList.add('error');
            isValid = false;
        }

        // Validate password
        if (password.value.length < 8) {
            password.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        // Simulate submission
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Show success
        showToast('Registration successful! Welcome to FaceSwap AI.');
        registerForm.reset();

        // Track registration (placeholder for GA4 / Meta Pixel)
        trackEvent('sign_up', { method: 'email' });
    });

    // Real-time validation removal on input
    ['email', 'password'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            input.classList.remove('error');
        });
    });

    // ============================================
    // OS Detection for Download Section
    // ============================================
    function detectOS() {
        const userAgent = navigator.userAgent;
        let os = 'unknown';

        if (userAgent.indexOf('Win') !== -1) {
            os = 'windows';
        } else if (userAgent.indexOf('Mac') !== -1) {
            os = 'macos';
        } else if (userAgent.indexOf('Linux') !== -1) {
            os = 'linux';
        }

        const downloadBtns = document.querySelectorAll('.download-btn');

        downloadBtns.forEach(btn => {
            const btnOS = btn.getAttribute('data-os');
            if (btnOS === os) {
                btn.classList.add('active-os');
            } else {
                btn.classList.remove('active-os');
            }

            // Add click tracking
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                trackEvent('download_click', { os: btnOS });
                showToast(`Download starting for ${btnOS === 'windows' ? 'Windows' : 'macOS'}...`);
            });
        });

        if (osDetect) {
            if (os === 'windows') {
                osDetect.textContent = 'We detected you are using Windows.';
            } else if (os === 'macos') {
                osDetect.textContent = 'We detected you are using macOS.';
            } else {
                osDetect.textContent = 'Select your operating system above.';
            }
        }
    }

    detectOS();

    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to relevant elements and observe them
    const animatedElements = document.querySelectorAll(
        '.feature-card, .step, .register-info, .register-form-wrapper, .download-content'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // ============================================
    // Toast Notification
    // ============================================
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // ============================================
    // Analytics Tracking Helper
    // ============================================
    function trackEvent(eventName, parameters = {}) {
        // Google Analytics 4 (gtag) - Uncomment when GA4 is configured
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', eventName, parameters);
        // }

        // Meta Pixel (fbq) - Uncomment when Meta Pixel is configured
        // if (typeof fbq !== 'undefined') {
        //     fbq('trackCustom', eventName, parameters);
        // }

        // Debug log (remove in production)
        console.log('[Track]', eventName, parameters);
    }

    // ============================================
    // Video Play Button (Demo)
    // ============================================
    const videoPlayBtn = document.querySelector('.video-play-btn');
    if (videoPlayBtn) {
        videoPlayBtn.addEventListener('click', () => {
            showToast('Video demo would play here. Add your CDN video URL.');
            trackEvent('play_demo_video');
        });
    }

    // ============================================
    // Performance: Preload Critical Resources
    // ============================================
    // Note: In production, add preload links for critical fonts/assets

    console.log('FaceSwap AI Landing Page initialized.');
});
