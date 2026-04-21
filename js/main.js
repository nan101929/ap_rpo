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
    // WhatsApp Registration
    // ============================================
    // TODO: Replace with your business WhatsApp number (digits only, no + or spaces)
    const BUSINESS_WHATSAPP_NUMBER = '1234567890';

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const countryCode = document.getElementById('countryCode');
        const phoneNumber = document.getElementById('phoneNumber');
        const phoneWrapper = document.querySelector('.phone-input-wrapper');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = true;

        // Reset errors
        phoneNumber.classList.remove('error');
        if (phoneWrapper) phoneWrapper.classList.remove('error');

        // Validate phone number
        const digitsOnly = phoneNumber.value.replace(/\D/g, '');
        if (digitsOnly.length < 7) {
            phoneNumber.classList.add('error');
            if (phoneWrapper) phoneWrapper.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state briefly
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 600));

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Build full phone number with country code
        const fullNumber = countryCode.value + digitsOnly;

        // Build pre-filled WhatsApp message
        const message = `Hi, I want to register for FaceSwap AI and claim my 5 free credits. My WhatsApp number is ${fullNumber}.`;
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Track registration attempt
        trackEvent('sign_up', { method: 'whatsapp' });

        // Open WhatsApp
        window.open(waUrl, '_blank');

        showToast('WhatsApp opened! Send the message to complete registration.');
        registerForm.reset();
    });

    // Real-time validation removal on input
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.classList.remove('error');
            const wrapper = document.querySelector('.phone-input-wrapper');
            if (wrapper) wrapper.classList.remove('error');
        });
    }

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
