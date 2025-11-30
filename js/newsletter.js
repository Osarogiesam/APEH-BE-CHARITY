/**
 * ===== NEWSLETTER SUBSCRIPTION HANDLER (UPDATED) =====
 * Handles newsletter subscriptions across all pages
 * Now dynamically captures all form fields to send as Brevo attributes.
 */

const NEWSLETTER_API_BASE_URL = typeof API_BASE_URL !== 'undefined'
    ? API_BASE_URL
    : 'http://localhost:3000/api';

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
 * Initialize newsletter forms when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  // Find all newsletter forms on the page
  const newsletterForms = document.querySelectorAll('#newsletterForm, .newsletter-form, form[id*="newsletter"]');
  
  newsletterForms.forEach(form => {
      form.addEventListener('submit', handleNewsletterSubscription);
  });
});

/**
* Handle newsletter subscription
*/
async function handleNewsletterSubscription(e) {
  e.preventDefault();
  
  // 1. Dynamically capture ALL form data
  const formData = new FormData(e.target);
  const payload = {};

  // Convert FormData to a regular object, prioritizing 'email', 'firstName', 'lastName'
  for (const [key, value] of formData.entries()) {
      const trimmedValue = value.trim();
      if (trimmedValue) {
          // Normalize keys for backend consistency (e.g., 'user_email' -> 'email')
          const normalizedKey = key.toLowerCase().includes('email') ? 'email' :
                                key.toLowerCase().includes('first') ? 'firstName' :
                                key.toLowerCase().includes('last') ? 'lastName' : 
                                key;
          payload[normalizedKey] = trimmedValue;
      }
  }

  const email = payload.email; 
  
  // Validate email
  if (!email || !isValidEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
  }
  
  payload.submittedAt = payload.submittedAt || new Date().toISOString();
  
  // Set default source if not present (e.g., not a hidden field in the form)
  if (!payload.source) {
      payload.source = 'website';
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : 'Subscribe';
  if (submitBtn) {
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;
  }
  
  const primaryRequest = async () => {
      const response = await fetch(`${NEWSLETTER_API_BASE_URL}/brevo/newsletter/subscribe`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to subscribe');
      }
  };
  
  try {
      const result = await runHybridSubmit({
          formKey: 'newsletter',
          payload,
          primaryRequest
      });
      
      if (result.primarySuccess) {
          showNotification('Successfully subscribed to newsletter!', 'success');
          e.target.reset();
      } else if (result.sheetSuccess) {
          showNotification('Our newsletter provider is unavailable, but we logged your subscription via Google Sheets. We will add you manually.', 'info');
      } else {
          showNotification('We could not subscribe automatically. Please use the email draft that just opened or try again later.', 'error');
      }
  } catch (error) {
      console.error('Newsletter subscription error:', error);
      showNotification('Failed to subscribe. Please try again later.', 'error');
  } finally {
      if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
      }
  }
}

/**
* Email validation helper
*/
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
* Show notification (using the provided logic and styles)
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