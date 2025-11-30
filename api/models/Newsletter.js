const mongoose = require('mongoose');
// const validator = require('validator'); // Uncomment and install if using validation

const newsletterSchema = new mongoose.Schema({
    // Subscriber email
    email: {
        type: String,
        required: true,
        unique: true, // Unique index is implicit here
        lowercase: true,
        trim: true,
        // Example of custom validation:
        /* validate: { 
            validator: function(v) { return validator.isEmail(v); },
            message: props => `${props.value} is not a valid email address!`
        } */
    },
    
    // Subscription source
    source: {
        type: String,
        default: 'website',
        lowercase: true
    },
    
    // Subscription status
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    
    // Brevo contact ID
    brevo_contact_id: {
        type: Number,
        unique: true,
        sparse: true, // Crucial for optional unique fields
        required: false
    },
    
    // Additional attributes
    attributes: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Unsubscribe timestamp (Date type is correct)
    unsubscribed_at: Date
}, {
    timestamps: true
});

// Explicit Indexes (Optimized)
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ createdAt: -1 });
// Compound Index for performance (optional)
// newsletterSchema.index({ source: 1, status: 1 }); 

module.exports = mongoose.model('Newsletter', newsletterSchema);