/**
 * ===== PAYMENT SYSTEM INTEGRATION =====
 * Handles Flutterwave and Paystack payment processing
 * All payments are in Nigerian Naira (NGN)
 */

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'https://apeh-be.onrender.com';
// Flutterwave Public Key (from environment or config)
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-5b3698877619a238fe7db400278fe87b-X';

// Paystack Public Key (from environment or config)
const PAYSTACK_PUBLIC_KEY = 'pk_test_b1698818dbc9f87189f44c241664e21b8b56c7ad';

/**
 * Initialize payment system when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Payment method selection handler
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Handle donation form submission
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationFormSubmit);
    }
    
    // Check for payment status in URL (after redirect from payment gateway)
    checkPaymentStatus();
});

/**
 * Handle payment method selection change
 * Shows/hides appropriate payment containers
 */
function handlePaymentMethodChange(event) {
    const selectedMethod = event.target.value;
    
    // Hide all payment containers
    hideAllPaymentContainers();
    
    // Show selected payment method container
    switch (selectedMethod) {
        case 'flutterwave':
            document.getElementById('flutterwave-payment-element').style.display = 'block';
            break;
        case 'paystack':
            document.getElementById('paystack-payment-element').style.display = 'block';
            break;
    }
}

/**
 * Hide all payment containers
 */
function hideAllPaymentContainers() {
    const containers = [
        'flutterwave-payment-element',
        'paystack-payment-element'
    ];
    
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
        }
    });
}

/**
 * Handle donation form submission
 * Prevents default submission and shows payment button
 */
function handleDonationFormSubmit(event) {
    event.preventDefault();
    
    const formData = getFormData();
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    // Validate form
    if (!validateDonationForm(formData)) {
        return;
    }
    
    // Check if payment method is selected
    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    // Show notification to click payment button
    showNotification('Please click the payment button above to proceed with your donation', 'info');
}

/**
 * ===== FLUTTERWAVE PAYMENT =====
 * Initialize Flutterwave payment
 */
async function initiateFlutterwavePayment() {
    const formData = getFormData();
    
    // Validate form data
    if (!validateDonationForm(formData)) {
        return;
    }

    storeDonationFormData(formData);
    
    const amount = parseFloat(formData.amount.replace(/,/g, ''));
    
    // Show loading state
    showNotification('Initializing payment...', 'info');
    
    try {
        // Initialize payment via backend API
        const response = await fetch(`${API_BASE_URL}/payments/flutterwave/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'NGN',
                email: formData.email,
                project: formData.project,
                donorInfo: {
                    name: formData.email.split('@')[0],
                    address: formData.address,
                    country: formData.country || 'Nigeria',
                    zipCode: formData.zipCode,
                    phone: formData.phone || ''
                }
            })
        });
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Server error' }));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.payment_url) {
            // Redirect to Flutterwave payment page
            window.location.href = data.payment_url;
        } else {
            throw new Error(data.error || 'Failed to initialize payment');
        }
    } catch (error) {
        console.error('Flutterwave payment error:', error);
        
        // Check if backend is running
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showNotification('Cannot connect to payment server. Please make sure the backend is running on http://localhost:3000', 'error');
        } else {
            showNotification('Failed to initialize payment: ' + (error.message || 'Please try again.'), 'error');
        }
    }
}

/**
 * ===== PAYSTACK PAYMENT =====
 * Initialize Paystack payment
 */
async function initiatePaystackPayment() {
    const formData = getFormData();
    
    // Validate form data
    if (!validateDonationForm(formData)) {
        return;
    }

    storeDonationFormData(formData);
    
    const amount = parseFloat(formData.amount.replace(/,/g, ''));
    
    // Show loading state
    showNotification('Initializing payment...', 'info');
    
    try {
        // Initialize payment via backend API
        const response = await fetch(`${API_BASE_URL}/payments/paystack/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'NGN',
                email: formData.email,
                project: formData.project,
                donorInfo: {
                    name: formData.email.split('@')[0],
                    address: formData.address,
                    country: formData.country || 'Nigeria',
                    zipCode: formData.zipCode,
                    phone: formData.phone || ''
                }
            })
        });
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Server error' }));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.authorization_url) {
            // Open Paystack payment popup
            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: formData.email,
                amount: amount * 100, // Convert to kobo
                currency: 'NGN',
                ref: data.reference,
                metadata: {
                    project: formData.project,
                    donor_name: formData.email.split('@')[0],
                    donor_country: formData.country || 'Nigeria'
                },
                callback: function(response) {
                    // Verify payment on backend
                    verifyPayment('paystack', response.reference);
                },
                onClose: function() {
                    showNotification('Payment was cancelled.', 'info');
                }
            });
            
            handler.openIframe();
        } else {
            throw new Error(data.error || 'Failed to initialize payment');
        }
    } catch (error) {
        console.error('Paystack payment error:', error);
        
        // Check if backend is running
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showNotification('Cannot connect to payment server. Please make sure the backend is running on http://localhost:3000', 'error');
        } else {
            showNotification('Failed to initialize payment: ' + (error.message || 'Please try again.'), 'error');
        }
    }
}

/**
 * Verify payment after completion
 * Called after user completes payment
 */
async function verifyPayment(paymentMethod, transactionId, reference = null) {
    try {
        if (!transactionId && !reference) {
            console.warn('Missing transaction details for verification');
            showNotification('Unable to verify payment because no transaction reference was provided. Please contact support.', 'error');
            return;
        }

        showNotification('Verifying payment...', 'info');
        
        const payload = {
            transaction_id: transactionId || null,
            reference: reference || transactionId || null
        };

        if (paymentMethod === 'flutterwave') {
            payload.tx_ref = reference || transactionId || null;
        }

        const response = await fetch(`${API_BASE_URL}/payments/${paymentMethod}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Payment successful
            showNotification('Payment successful! Thank you for your donation.', 'success');
            
            // Add donor to Brevo email list
            const storedFormData = getStoredDonationFormData();
            const formData = storedFormData || getFormData();
            await addToBrevoList(formData, 'donation');
            clearStoredDonationFormData();
            
            // Reset form
            const donationForm = document.getElementById('donationForm');
            if (donationForm) {
                donationForm.reset();
            }
            hideAllPaymentContainers();
            
            // Redirect to thank you page or show success message
            setTimeout(() => {
                window.location.href = 'donate.html?status=success';
            }, 2000);
        } else {
            throw new Error(data.message || 'Payment verification failed');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        
        // Check if backend is running
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showNotification('Cannot verify payment. Please make sure the backend is running. Contact support if payment was deducted.', 'error');
        } else {
            showNotification('Payment verification failed: ' + (error.message || 'Please contact support if payment was deducted.'), 'error');
        }
    }
}

/**
 * Check payment status from URL parameters
 * Called when user returns from payment gateway
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const txRef = urlParams.get('tx_ref');
    const flutterwaveTransactionId = urlParams.get('transaction_id');
    const ref = urlParams.get('ref');
    
    if (status === 'flutterwave' && (flutterwaveTransactionId || txRef)) {
        // Verify Flutterwave payment
        verifyPayment('flutterwave', flutterwaveTransactionId || null, txRef || flutterwaveTransactionId);
    } else if (status === 'paystack' && ref) {
        // Verify Paystack payment
        verifyPayment('paystack', ref);
    } else if (status === 'success') {
        showNotification('Thank you for your donation!', 'success');
    }
}

/**
 * Get form data from donation form
 */
function getFormData() {
    return {
        amount: document.getElementById('amount').value,
        project: document.getElementById('project').value,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value,
        country: document.getElementById('country').value,
        zipCode: document.getElementById('zipCode').value,
        phone: document.getElementById('phone') ? document.getElementById('phone').value : ''
    };
}

function storeDonationFormData(data) {
    try {
        sessionStorage.setItem('donationFormData', JSON.stringify(data));
    } catch (error) {
        console.warn('Unable to store donation data locally:', error);
    }
}

function getStoredDonationFormData() {
    try {
        const stored = sessionStorage.getItem('donationFormData');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.warn('Unable to retrieve stored donation data:', error);
        return null;
    }
}

function clearStoredDonationFormData() {
    try {
        sessionStorage.removeItem('donationFormData');
    } catch (error) {
        console.warn('Unable to clear stored donation data:', error);
    }
}

/**
 * Validate donation form data
 */
function validateDonationForm(data) {
    let isValid = true;
    const errors = [];
    
    // Validate amount
    const amount = parseFloat(data.amount.replace(/,/g, ''));
    if (!data.amount || isNaN(amount) || amount <= 0) {
        errors.push('Please enter a valid donation amount');
        isValid = false;
    }
    
    // Validate minimum amount (e.g., 100 NGN)
    if (amount < 100) {
        errors.push('Minimum donation amount is ₦100');
        isValid = false;
    }
    
    // Validate project selection
    if (!data.project) {
        errors.push('Please select a project');
        isValid = false;
    }
    
    // Validate address
    if (!data.address || data.address.trim().length < 10) {
        errors.push('Please enter a complete address');
        isValid = false;
    }
    
    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
        isValid = false;
    }
    
    // Validate country
    if (!data.country || data.country.trim().length < 2) {
        errors.push('Please enter your country');
        isValid = false;
    }
    
    // Validate zip code
    if (!data.zipCode || data.zipCode.trim().length < 3) {
        errors.push('Please enter a valid zip code');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification(errors.join('<br>'), 'error');
    }
    
    return isValid;
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Add donor to Brevo email list
 */
async function addToBrevoList(formData, source = 'donation') {
    try {
        if (!formData || !formData.email) {
            console.warn('Skipping Brevo sync because donor email is missing.');
            return;
        }

        const firstName = formData.email.includes('@')
            ? formData.email.split('@')[0]
            : formData.email;

        const response = await fetch(`${API_BASE_URL}/brevo/add-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                firstName: firstName,
                lastName: '',
                attributes: {
                    donation_amount: formData.amount,
                    project: formData.project,
                    country: formData.country,
                    source: source,
                    payment_method: 'flutterwave_or_paystack'
                },
                listIds: [1] // Default list ID
            })
        });
        
        if (response.ok) {
            console.log('Successfully added to Brevo list');
        } else {
            console.error('Failed to add to Brevo list');
        }
    } catch (error) {
        console.error('Error adding to Brevo list:', error);
    }
}

/**
 * Show notification to user
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

// Video toggle function (if video exists on page)
function toggleVideo() {
    const video = document.querySelector('.flood-video');
    if (!video) return;
    
    const playButton = document.querySelector('.play-button i');
    
    if (video.paused) {
        video.play();
        if (playButton) playButton.className = 'fas fa-pause';
    } else {
        video.pause();
        if (playButton) playButton.className = 'fas fa-play';
    }
}

// Console welcome message
console.log('%c💳 Payment System Loaded', 'color: #28a745; font-size: 18px; font-weight: bold;');
console.log('%cFlutterwave & Paystack integration ready!', 'color: #17a2b8; font-size: 14px;');

