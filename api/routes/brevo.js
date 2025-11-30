/**
 * ===== BREVO ROUTES =====
 * API routes for email services and form submissions
 */

const express = require('express');
const router = express.Router();

// Import controllers
const brevoController = require('../controllers/brevo.controller');

// Contact management routes
router.post('/add-contact', brevoController.addContact);
router.post('/send-email', brevoController.sendEmail);

// Newsletter routes
router.post('/newsletter/subscribe', brevoController.subscribeNewsletter);

// Form submission routes
router.post('/contact-form', brevoController.submitContactForm);

module.exports = router;

