/**
 * ===== PAYMENT SYSTEM INTEGRATION =====
 * Handles Flutterwave and Paystack payment processing
 * All payments are in Nigerian Naira (NGN)
 */

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'apeh-be-charitable-foundation-api.onrender.com';

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
            showNotification('Cannot connect to payment server. Please make sure the backend is running', 'error');
        } else {
            showNotification('Failed to initialize payment: ' + (error.message || 'Please try again.'), 'error');
        }
    }
}


/**
 * Helper function to verify payment status with backend
 */
async function verifyPayment(gateway, reference) {
    // Show loading state
    showNotification('Verifying payment...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/payments/${gateway}/verify/${reference}`);
        
        if (!response.ok) {
            throw new Error('Payment verification failed on server side.');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Payment successful
            showNotification('Payment successful! Thank you for your donation.', 'success');
            // Clear form or redirect as needed
        } else {
            throw new Error(data.message || 'Payment verification failed.');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        showNotification('Payment verification failed: ' + error.message, 'error');
    }
}


/**
 * Helper function to check payment status on page load (e.g., after redirect)
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const gateway = urlParams.get('gateway');

    if (reference && gateway) {
        verifyPayment(gateway, reference);
        // Clean URL after verification (optional)
        history.replaceState(null, '', window.location.pathname);
    }
}


/**
 * Helper function to get form data
 */
function getFormData() {
    const form = document.getElementById('donationForm');
    return {
        amount: form.querySelector('#amount').value,
        email: form.querySelector('#email').value,
        project: form.querySelector('#project').value,
        address: form.querySelector('#address').value,
        country: form.querySelector('#country').value,
        zipCode: form.querySelector('#zipCode').value,
        phone: form.querySelector('#phone').value
    };
}

/**
 * Helper function to validate form data
 */
function validateDonationForm(data) {
    if (!data.amount || parseFloat(data.amount.replace(/,/g, '')) <= 0) {
        showNotification('Please enter a valid donation amount.', 'error');
        return false;
    }
    if (!data.email || !data.email.includes('@')) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    return true;
}

/**
 * Helper function for notifications (assumed to exist in script.js)
 */
function showNotification(message, type) {
    console.log(`[Notification - ${type}]: ${message}`);
    // Implement actual UI notification logic here if needed
}

/**
 * Helper function to store form data (e.g., in localStorage)
 */
function storeDonationFormData(data) {
    localStorage.setItem('donation_form_data', JSON.stringify(data));
}
