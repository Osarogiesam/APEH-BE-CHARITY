/**
 * ===== FORM SUBMISSION MODEL =====
 * Database schema for storing form submissions (contact, volunteer, etc.)
 */

const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
    // Form type (contact, volunteer, etc.)
    form_type: {
        type: String,
        required: true,
        enum: ['contact', 'volunteer', 'general'],
        lowercase: true
    },
    
    // Submitter information
    submitter: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: String,
        address: String,
        country: String
    },
    
    // Form-specific fields
    inquiry_type: String, // For contact forms
    message: {
        type: String,
        required: true
    },
    
    // Additional form data
    form_data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Email status
    email_sent: {
        type: Boolean,
        default: false
    },
    
    // Email sent timestamp
    email_sent_at: Date,
    
    // Status
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    }
}, {
    timestamps: true
});

// Indexes (Duplicate email index removed)
formSubmissionSchema.index({ form_type: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
