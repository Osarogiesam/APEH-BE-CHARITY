/**
 * ===== CONTACT PAGE JAVASCRIPT =====
 * Handles contact form submission with Brevo integration and mailto fallback
 */

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

async function runHybridSubmit(options) {
    if (typeof window.submitFormWithFallbacks === 'function') {
        return window.submitFormWithFallbacks(options);
    }
    
    if (typeof options.primaryRequest === 'function') {
        await options.primaryRequest();
    }
    
    return { primarySuccess: true, sheetSuccess: false };
}

/**
 * Initialize when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }

    // Initialize form validation
    initializeFormValidation();

    // Initialize animations
    initializeAnimations();
});

/**
 * Handle contact form submission
 * Submits to backend API (Brevo) with Google Sheets + mailto fallbacks
 */
async function handleContactSubmission(e) {
    e.preventDefault();
    
    const formPayload = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        inquiryType: document.getElementById('inquiryType').value,
        message: document.getElementById('message').value.trim(),
        submittedAt: new Date().toISOString()
    };

    if (!validateContactForm(formPayload)) {
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Send';
    
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }

    const primaryRequest = async () => {
        const response = await fetch(`${API_BASE_URL}/brevo/contact-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formPayload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to submit form');
        }
    };

    try {
        const result = await runHybridSubmit({
            formKey: 'contact',
            payload: formPayload,
            primaryRequest
        });

        if (result.primarySuccess) {
            showNotification('Thank you for your message! We will get back to you within 24 hours.', 'success');
        } else if (result.sheetSuccess) {
            showNotification('Our primary inbox is unavailable, but we logged your message securely. Expect a follow-up shortly.', 'info');
        } else {
            showNotification('We could not reach our servers. Please use the email draft that just opened to finish your submission.', 'error');
        }

        e.target.reset();
    } catch (error) {
        console.error('Contact form submission error:', error);
        showNotification('Something went wrong. Please try again later or email us directly.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

/**
 * Validate contact form
 */
function validateContactForm(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Please enter a valid full name');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.inquiryType) {
        errors.push('Please select an inquiry type');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message (at least 10 characters)');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
        case 'text':
            if (field.id === 'fullName') {
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
            }
            break;
        case 'email':
            if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'tel':
            if (value.length > 0 && value.length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
    }

    if (field.tagName === 'SELECT' && !value) {
        isValid = false;
        errorMessage = 'Please select an option';
    }

    if (field.tagName === 'TEXTAREA' && value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters';
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Initialize animations
 */
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.contact-item, .contact-form-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
                padding: 1rem;
            }
            .notification-success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .notification-error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            .notification-info {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
            }
            .notification-content {
                display: flex;
                align-items: center;
            }
            .notification-content i {
                margin-right: 0.5rem;
                font-size: 1.2rem;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                margin-left: auto;
                cursor: pointer;
                color: inherit;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Google Maps (if needed)
function initMap() {
    // Default coordinates for Nigeria (Lagos area)
    const center = { lat: 6.5244, lng: 3.3792 };
    
    if (typeof google !== 'undefined' && google.maps) {
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: center,
        });

        // Add marker for office location
        const marker = new google.maps.Marker({
            position: center,
            map: map,
            title: "APEH-BE-CHARITY Office"
        });
    }
}
