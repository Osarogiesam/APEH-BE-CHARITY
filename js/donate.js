/**
 * ===== DONATION PAGE JAVASCRIPT =====
 * UI enhancements and form field interactions
 * Payment processing is handled by payments.js
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== AMOUNT FORMATTING =====
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d.]/g, '');
            if (value && !isNaN(value)) {
                // Format as currency (NGN)
                const formatted = parseFloat(value).toLocaleString('en-NG', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
                e.target.value = formatted;
            }
        });
    }
    
    // ===== PROJECT SELECTION ENHANCEMENT =====
    const projectSelect = document.getElementById('project');
    if (projectSelect) {
        projectSelect.addEventListener('change', function(e) {
            const selectedProject = e.target.value;
            if (selectedProject) {
                // Add visual feedback
                e.target.style.borderColor = 'var(--primary-brown)';
                e.target.style.backgroundColor = 'rgba(107, 62, 46, 0.05)';
            }
        });
    }
    
    // ===== DONATION AMOUNT SUGGESTIONS (NGN) =====
    if (amountInput) {
        const amountSuggestions = document.createElement('div');
        amountSuggestions.className = 'amount-suggestions';
        amountSuggestions.innerHTML = `
            <p class="suggestion-label">Quick amounts:</p>
            <div class="suggestion-buttons">
                <button type="button" class="btn btn-outline-primary suggestion-btn" data-amount="1000">₦1,000</button>
                <button type="button" class="btn btn-outline-primary suggestion-btn" data-amount="5000">₦5,000</button>
                <button type="button" class="btn btn-outline-primary suggestion-btn" data-amount="10000">₦10,000</button>
                <button type="button" class="btn btn-outline-primary suggestion-btn" data-amount="50000">₦50,000</button>
            </div>
        `;
        
        amountInput.parentNode.appendChild(amountSuggestions);
        
        // Add CSS for suggestions
        const style = document.createElement('style');
        style.textContent = `
            .amount-suggestions {
                margin-top: 0.5rem;
            }
            
            .suggestion-label {
                font-size: 0.9rem;
                color: var(--text-dark);
                margin-bottom: 0.5rem;
            }
            
            .suggestion-buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .suggestion-btn {
                padding: 0.25rem 0.75rem;
                font-size: 0.85rem;
                border-radius: 15px;
            }
            
            .suggestion-btn:hover {
                background: var(--primary-brown);
                color: white;
                border-color: var(--primary-brown);
            }
        `;
        document.head.appendChild(style);
        
        // Handle suggestion button clicks
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const amount = this.getAttribute('data-amount');
                amountInput.value = parseInt(amount).toLocaleString('en-NG');
                amountInput.focus();
            });
        });
    }
    
    // ===== FORM FIELD ANIMATIONS =====
    const formFields = document.querySelectorAll('.donation-form .form-control, .donation-form .form-select');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 0 0 0.2rem rgba(107, 62, 46, 0.25)';
        });
        
        field.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // ===== FAQ ACCORDION ENHANCEMENT =====
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add smooth transition
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            if (target) {
                target.style.transition = 'all 0.3s ease';
            }
        });
    });
    
    // ===== FAQ CONTACT CARD =====
    const faqContactBtn = document.querySelector('.faq-contact-card .btn');
    if (faqContactBtn) {
        faqContactBtn.addEventListener('click', function() {
            // Use the showNotification function from payments.js
            if (typeof showNotification === 'function') {
                showNotification('Thank you for your interest! Please use our contact form or email us directly at osarogie.idumwonyi@eng.uniben.edu', 'info');
            } else {
                alert('Thank you for your interest! Please use our contact form or email us directly at osarogie.idumwonyi@eng.uniben.edu');
            }
        });
    }
    
    // ===== SMOOTH SCROLLING FOR INTERNAL LINKS =====
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== CONSOLE WELCOME MESSAGE =====
    console.log('%c💝 APEH-BE-CHARITY Donation Page', 'color: #6B3E2E; font-size: 20px; font-weight: bold;');
    console.log('%cThank you for considering a donation!', 'color: #8B4513; font-size: 14px;');
    console.log('%cYour contribution makes a real difference.', 'color: #D2B48C; font-size: 12px;');
});
