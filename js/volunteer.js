// ===== VOLUNTEER PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    // Volunteer form submission
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerSubmission);
    }

    // Event registration handlers
    const eventRegisterBtns = document.querySelectorAll('.events-table .btn');
    eventRegisterBtns.forEach(btn => {
        btn.addEventListener('click', handleEventRegistration);
    });

    // Tab functionality for involvement section
    const involvementTabs = document.querySelectorAll('#involvementTabs button[data-bs-toggle="pill"]');
    involvementTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const targetTab = event.target.getAttribute('data-bs-target');
            updateTabContent(targetTab);
        });
    });

    // Initialize animations
    initializeAnimations();
});

// API Base URL
const API_BASE_URL = 'https://apeh-be.onrender.com';

async function runHybridSubmit(options) {
    if (typeof window.submitFormWithFallbacks === 'function') {
        return window.submitFormWithFallbacks(options);
    }
    
    if (typeof options.primaryRequest === 'function') {
        await options.primaryRequest();
    }
    
    return { primarySuccess: true, sheetSuccess: false };
}

// Handle volunteer form submission
async function handleVolunteerSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const volunteerData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        city: document.getElementById('city').value.trim(),
        interests: document.getElementById('interests').value.trim(),
        availability: document.getElementById('availability').value.trim(),
        submittedAt: new Date().toISOString()
    };

    // Validate form
    if (!validateVolunteerForm(volunteerData)) {
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const primaryRequest = async () => {
        const response = await fetch(`${API_BASE_URL}/brevo/contact-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: volunteerData.fullName,
                email: volunteerData.email,
                inquiryType: 'volunteer',
                message: `Volunteer Application\n\nPhone: ${volunteerData.phone}\nCity: ${volunteerData.city}\n\nInterests:\n${volunteerData.interests}\n\nAvailability:\n${volunteerData.availability}`,
                phone: volunteerData.phone,
                address: volunteerData.city,
                country: 'Nigeria'
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to submit form');
        }
    };

    try {
        const result = await runHybridSubmit({
            formKey: 'volunteer',
            payload: volunteerData,
            primaryRequest
        });

        if (result.primarySuccess) {
            showNotification('Thank you for your interest in volunteering! We will contact you soon.', 'success');
        } else if (result.sheetSuccess) {
            showNotification('Our email service is temporarily unavailable, but we logged your volunteer application securely.', 'info');
        } else {
            showNotification('We could not reach our servers. Please use the email draft that just opened to complete your application.', 'error');
        }

        e.target.reset();
    } catch (error) {
        console.error('Volunteer form submission error:', error);
        showNotification('Something went wrong. Please try again later or email us directly.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Validate volunteer form
function validateVolunteerForm(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Please enter a valid full name');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!data.city || data.city.trim().length < 2) {
        errors.push('Please enter a valid city');
    }
    
    if (!data.interests || data.interests.trim().length < 10) {
        errors.push('Please provide more details about your interests');
    }
    
    if (!data.availability || data.availability.trim().length < 10) {
        errors.push('Please provide more details about your availability');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Handle event registration
function handleEventRegistration(e) {
    e.preventDefault();
    
    const eventRow = e.target.closest('tr');
    const eventName = eventRow.querySelector('td:first-child').textContent;
    const eventDate = eventRow.querySelector('td:nth-child(2)').textContent;
    const eventLocation = eventRow.querySelector('td:nth-child(3)').textContent;
    
    // Show registration modal
    showEventRegistrationModal({
        name: eventName,
        date: eventDate,
        location: eventLocation
    });
}

// Show event registration modal
function showEventRegistrationModal(event) {
    const modal = document.createElement('div');
    modal.className = 'event-registration-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Register for ${event.name}</h3>
                <div class="event-details">
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
                <form class="event-registration-form">
                    <div class="mb-3">
                        <label for="regName" class="form-label">Full Name *</label>
                        <input type="text" class="form-control" id="regName" required>
                    </div>
                    <div class="mb-3">
                        <label for="regEmail" class="form-label">Email *</label>
                        <input type="email" class="form-control" id="regEmail" required>
                    </div>
                    <div class="mb-3">
                        <label for="regPhone" class="form-label">Phone *</label>
                        <input type="tel" class="form-control" id="regPhone" required>
                    </div>
                    <div class="mb-3">
                        <label for="regNotes" class="form-label">Additional Notes</label>
                        <textarea class="form-control" id="regNotes" rows="3"></textarea>
                    </div>
                    <div class="text-end">
                        <button type="button" class="btn btn-secondary me-2" onclick="this.closest('.event-registration-modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Register</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('.event-registration-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEventRegistrationSubmission(e, event);
    });
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close-btn');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => modal.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) modal.remove();
    });
    
    // Add modal styles
    addModalStyles();
}

// Handle event registration form submission
async function handleEventRegistrationSubmission(e, event) {
    const formData = new FormData(e.target);
    const registrationData = {
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        fullName: formData.get('regName') || document.getElementById('regName').value,
        email: formData.get('regEmail') || document.getElementById('regEmail').value,
        phone: formData.get('regPhone') || document.getElementById('regPhone').value,
        notes: formData.get('regNotes') || document.getElementById('regNotes').value,
        submittedAt: new Date().toISOString()
    };

    // Validate form
    if (!registrationData.fullName || !registrationData.email || !registrationData.phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!isValidEmail(registrationData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    const primaryRequest = async () => {
        const response = await fetch(`${API_BASE_URL}/brevo/contact-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: registrationData.fullName,
                email: registrationData.email,
                inquiryType: 'event',
                message: `Event Registration\n\nEvent: ${registrationData.eventName}\nDate: ${registrationData.eventDate}\nLocation: ${registrationData.eventLocation}\n\nPhone: ${registrationData.phone}\nNotes:\n${registrationData.notes || 'N/A'}`,
                phone: registrationData.phone,
                address: registrationData.eventLocation,
                country: 'Nigeria'
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to submit event registration');
        }
    };

    try {
        const result = await runHybridSubmit({
            formKey: 'eventRegistration',
            payload: registrationData,
            primaryRequest
        });

        if (result.primarySuccess || result.sheetSuccess) {
            showNotification(`Successfully registered for ${event.name}! You will receive a confirmation email shortly.`, 'success');
            e.target.closest('.event-registration-modal').remove();
            sendEventConfirmation(registrationData);
        } else {
            showNotification('We could not register automatically. Please use the email draft that just opened or try again later.', 'error');
        }
    } catch (error) {
        console.error('Event registration submission error:', error);
        showNotification('Something went wrong. Please try again later or email us directly.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Update tab content based on selection
function updateTabContent(targetTab) {
    // Add any dynamic content loading here
    console.log('Tab changed to:', targetTab);
}

// Initialize animations
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
    const animatedElements = document.querySelectorAll('.opportunity-card, .testimonial-card, .event-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Send event confirmation (placeholder)
function sendEventConfirmation(data) {
    // In a real application, this would send a confirmation email
    console.log('Sending event confirmation for:', data.fullName);
    
    // You could integrate with your email service here
    // Example: sendEmail(data.email, 'Event Registration Confirmation', formatEventConfirmationEmail(data));
}

// Add modal styles
function addModalStyles() {
    if (document.getElementById('volunteer-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'volunteer-modal-styles';
    style.textContent = `
        .event-registration-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .modal-content {
            position: relative;
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        .event-details {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        .event-details p {
            margin: 0.5rem 0;
        }
    `;
    document.head.appendChild(style);
}

// Smooth scrolling for anchor links
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

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
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
                padding: 1rem;
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
