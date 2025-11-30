/**
 * ===== TRANSACTION MODEL =====
 * Database schema for storing payment transactions
 * Supports Flutterwave and Paystack payments
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Transaction identifier from payment gateway
    transaction_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Payment amount in NGN (Nigerian Naira)
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Currency (default: NGN)
    currency: {
        type: String,
        required: true,
        default: 'NGN',
        uppercase: true
    },
    
    // Payment gateway used (flutterwave or paystack)
    payment_method: {
        type: String,
        required: true,
        enum: ['flutterwave', 'paystack'],
        lowercase: true
    },
    
    // Transaction status
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        lowercase: true
    },
    
    // Project the donation is for
    project: {
        type: String,
        required: true
    },
    
    // Donor information
    donor: {
        email: { 
            type: String, 
            required: true,
            lowercase: true,
            trim: true
        },
        name: String,
        address: String,
        country: {
            type: String,
            default: 'Nigeria'
        },
        zipCode: String,
        phone: String
    },
    
    // Additional metadata
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Full transaction data from payment gateway
    transaction_data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Timestamps
    verified_at: Date,
    failed_at: Date,
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
transactionSchema.index({ 'donor.email': 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ created_at: -1 });
transactionSchema.index({ payment_method: 1 });

// Export Transaction model
module.exports = mongoose.model('Transaction', transactionSchema);

