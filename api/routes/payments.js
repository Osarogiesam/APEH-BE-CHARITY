/**
 * ===== PAYMENT ROUTES =====
 * API routes for payment processing (Flutterwave & Paystack)
 */

const express = require('express');
const router = express.Router();

// Import controllers
const flutterwaveController = require('../controllers/flutterwave.controller');
const paystackController = require('../controllers/paystack.controller');

// Flutterwave routes
router.post('/flutterwave/initialize', flutterwaveController.initialize);
router.post('/flutterwave/verify', flutterwaveController.verify);

// Paystack routes
router.post('/paystack/initialize', paystackController.initialize);
router.post('/paystack/verify', paystackController.verify);

module.exports = router;

