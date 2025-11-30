// ===== MOBILE-FIRST RESPONSIVE NGO WEBSITE JAVASCRIPT =====

(function initializeFormFallbacks() {
    const defaultRecipient = 'osarogie.idumwonyi@eng.uniben.edu';
    
    const defaultConfig = {
        defaultRecipient,
        contact: {
            label: 'Contact Form',
            sheetName: 'Contact_Submissions',
            scriptUrl: 'https://script.google.com/macros/s/AKfycbz1KxWF-XR1mfUnLQfz8H-aqUAGLVhi4_qEVyBR9yyeQ3Z4G497SpWkjxvp3OydPekX/exec',
            mailto: defaultRecipient,
            subject: 'Contact Form Submission'
        },
        volunteer: {
            label: 'Volunteer Application',
            sheetName: 'Volunteer_Applications',
            scriptUrl: 'https://script.google.com/macros/s/AKfycbzRNgIs9PffSJwsruqQm9vtl14PfbW79TPiWC1MLgSFLdnjpgkrhx_RoTsqsj_X12FE/exec',
            mailto: defaultRecipient,
            subject: 'New Volunteer Application'
        },
        eventRegistration: {
            label: 'Event Registration',
            sheetName: 'Event_Registrations',
            scriptUrl: 'https://script.google.com/macros/s/AKfycbyWs2xmPtyZXhyDsaFUBvYEkj22lJYeLqd58jcZ_KoAfl0MeI6DZzQ3h91g5JccO_Yi/exec',
            mailto: defaultRecipient,
            subject: 'Event Registration Submission'
        },
        newsletter: {
            label: 'Newsletter Signup',
            sheetName: 'Newsletter_Subscribers',
            scriptUrl: 'https://script.google.com/macros/s/AKfycbzzFpB_dmfEptlRhS5yc0jLEwkZTGJFNPdv7z8F-z73r9hkQMvMya5EhcsAMx2jE7Mk/exec',
            mailto: defaultRecipient,
            subject: 'Newsletter Subscription'
        }
    };
    
    window.FORM_FALLBACK_CONFIG = {
        ...defaultConfig,
        ...(window.FORM_FALLBACK_CONFIG || {})
    };
    
    function normalizePayload(formKey, payload = {}) {
        const cleaned = JSON.parse(JSON.stringify(payload));
        cleaned.formKey = formKey;
        cleaned.submittedAt = cleaned.submittedAt || new Date().toISOString();
        return cleaned;
    }
    
    window.syncFormToGoogleSheets = async function(formKey, payload) {
        const config = window.FORM_FALLBACK_CONFIG[formKey];
        
        if (!config?.scriptUrl) {
            console.warn(`No Google Sheets Apps Script URL configured for form "${formKey}"`);
            return { success: false, error: 'Missing script URL' };
        }
        
        const normalizedPayload = normalizePayload(formKey, payload);
        
        const response = await fetch(config.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sheetName: config.sheetName || formKey,
                data: normalizedPayload
            })
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Google Sheets sync failed (${response.status}): ${text}`);
        }
        
        let parsed = {};
        try {
            parsed = await response.json();
        } catch (error) {
            // Some Apps Script deployments return empty responses; treat OK as success.
        }
        
        if (parsed.success === false) {
            throw new Error(parsed.error || 'Google Sheets sync reported an error');
        }
        
        return { success: true };
    };
    
    window.triggerMailtoFallback = function(formKey, payload) {
        const config = window.FORM_FALLBACK_CONFIG[formKey];
        const recipient = config?.mailto || window.FORM_FALLBACK_CONFIG.defaultRecipient;
        
        if (!recipient) {
            console.warn(`No mailto fallback configured for form "${formKey}"`);
            return;
        }
        
        const normalizedPayload = normalizePayload(formKey, payload);
        const subject = encodeURIComponent(config?.subject || `${config?.label || formKey} Submission`);
        const body = encodeURIComponent(
            `${config?.label || formKey} Submission\n\n${Object.entries(normalizedPayload)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}`
        );
        
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    };
    
    window.submitFormWithFallbacks = async function({ formKey, payload, primaryRequest }) {
        const normalizedPayload = normalizePayload(formKey, payload);
        let primarySuccess = false;
        let sheetSuccess = false;
        let primaryError = null;
        
        if (typeof primaryRequest === 'function') {
            try {
                await primaryRequest();
                primarySuccess = true;
            } catch (error) {
                primaryError = error;
                console.error(`Primary submission failed for ${formKey}:`, error);
            }
        }
        
        try {
            await window.syncFormToGoogleSheets(formKey, normalizedPayload);
            sheetSuccess = true;
        } catch (error) {
            console.error(`Google Sheets sync failed for ${formKey}:`, error);
        }
        
        if (!primarySuccess && !sheetSuccess) {
            window.triggerMailtoFallback(formKey, normalizedPayload);
        }
        
        return { primarySuccess, sheetSuccess, primaryError };
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header-section');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.classList.remove('scrolled');
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // ===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== MOBILE MENU TOGGLE =====
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = navbarCollapse.classList.contains('show');
            
            if (isExpanded) {
                navbarCollapse.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
            } else {
                navbarCollapse.classList.add('show');
                navbarToggler.setAttribute('aria-expanded', 'true');
            }
        });

        // Close mobile menu when clicking on a link
        const mobileNavLinks = document.querySelectorAll('.navbar-nav .nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarCollapse.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);
            
            if (!isClickInsideNav && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===== ANIMATION ON SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.stat-card, .project-card, .blog-card, .volunteer-card, .contact-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // ===== STATISTICS COUNTER ANIMATION =====
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + '+';
        }, 20);
    };

    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const targetValue = parseInt(statNumber.textContent.replace(/[^\d]/g, ''));
                animateCounter(statNumber, targetValue);
                statsObserver.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });

    // ===== CONTACT FORM HANDLING =====
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const subject = this.querySelectorAll('input[type="text"]')[1].value;
            const message = this.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            this.reset();
        });
    }

    // ===== NEWSLETTER SIGNUP =====
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Subscribe to Brevo newsletter
            subscribeToNewsletter(email);
        });
    }
    
    // ===== BREVO NEWSLETTER SUBSCRIPTION =====
    async function subscribeToNewsletter(email) {
        try {
            const response = await fetch('/api/newsletter-subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    source: 'website'
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                document.querySelector('.newsletter-form').reset();
            } else {
                throw new Error(result.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            // Fallback to local success message if API is not available
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            document.querySelector('.newsletter-form').reset();
        }
    }

    // ===== DONATION BUTTONS =====
    const donateButtons = document.querySelectorAll('a[href="#donate"]');
    
    donateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Thank you for your interest in donating! Please contact us for donation details.', 'info');
        });
    });

    // ===== PROJECT CARD INTERACTIONS =====
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ===== BLOG CARD INTERACTIONS =====
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        card.addEventListener('click', function() {
            showNotification('Blog post coming soon!', 'info');
        });
    });

    // ===== VOLUNTEER CARD INTERACTIONS =====
    const volunteerCards = document.querySelectorAll('.volunteer-card');
    
    volunteerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ===== UTILITY FUNCTIONS =====
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'info' ? '#17a2b8' : '#6c757d'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    // ===== LAZY LOADING FOR IMAGES =====
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // ===== SCROLL TO TOP FUNCTIONALITY =====
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: var(--primary-brown);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== ADD CSS ANIMATIONS =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 10px;
        }
        
        .scroll-to-top:hover {
            background: var(--dark-brown);
            transform: translateY(-2px);
        }
        
        .lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .lazy.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // ===== PERFORMANCE OPTIMIZATION =====
    
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            // Scroll-based functionality here
        }, 10);
    });
    
    // ===== ACCESSIBILITY IMPROVEMENTS =====
    
    // Add keyboard navigation for custom elements
    const interactiveElements = document.querySelectorAll('.project-card, .blog-card, .volunteer-card');
    
    interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
    
    // ===== CONSOLE WELCOME MESSAGE =====
    console.log('%c🌍 APEH-BE-CHARITY Website', 'color: #6B3E2E; font-size: 20px; font-weight: bold;');
    console.log('%cThank you for visiting our website!', 'color: #8B4513; font-size: 14px;');
    console.log('%cTogether, we can make a difference.', 'color: #D2B48C; font-size: 12px;');
});

// ===== GLOBAL FUNCTIONS =====

// Function to handle external link clicks
function handleExternalLink(url) {
    if (confirm('This will take you to an external website. Continue?')) {
        window.open(url, '_blank');
    }
}

// Function to share content
function shareContent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
    }
}

// ===== SERVICE WORKER REGISTRATION (for PWA features) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
 const scriptURL = 'https://script.google.com/macros/s/AKfycbzeDHodr8HUx7yDAgY3Ngi9qQt9yb9OCe0nhle-edn87Cd9iuTjdcYisN14GmAn2iR6/exec'
  const form = document.forms['submit-to-google-sheet']

  form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
      .then(response => console.log('Success!', response))
      .catch(error => console.error('Error!', error.message))
  })