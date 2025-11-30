/**
 * ===== BREVO (SENDINBLUE) EMAIL CONTROLLER (UPDATED) =====
 * Handles email sending and contact management via Brevo API
 */

const SibApiV3Sdk = require('@getbrevo/brevo'); 
const FormSubmission = require('../models/FormSubmission');
const Newsletter = require('../models/Newsletter');

// Initialize Brevo API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const contactsApi = new SibApiV3Sdk.ContactsApi();

// Set API key
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Add contact to Brevo (General purpose, remains unchanged)
 * Adds or updates a contact in Brevo email list
 */
exports.addContact = async (req, res) => {
    try {
        const { email, firstName, lastName, attributes = {}, listIds = [] } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Prepare contact data
        const createContact = new SibApiV3Sdk.CreateContact(); 
        createContact.email = email;
        createContact.attributes = {
            FIRSTNAME: firstName || email.split('@')[0],
            LASTNAME: lastName || '',
            ...attributes
        };
        createContact.listIds = listIds.length > 0 ? listIds : [1]; // Default list ID is 1
        createContact.updateEnabled = true; // Update if contact already exists
        
        // Add contact to Brevo
        const result = await contactsApi.createContact(createContact);
        
        res.json({ 
            success: true, 
            contactId: result.id,
            message: 'Contact added successfully' 
        });
    } catch (error) {
        console.error('Error adding contact to Brevo:', error);
        
        // If contact already exists, try to update
        if (error.status === 400 && error.text && error.text.includes('already exists')) {
            try {
                const updateContact = new SibApiV3Sdk.UpdateContact(); 
                updateContact.attributes = {
                    FIRSTNAME: req.body.firstName || req.body.email.split('@')[0],
                    LASTNAME: req.body.lastName || '',
                    ...req.body.attributes
                };
                updateContact.listIds = req.body.listIds.length > 0 ? req.body.listIds : [1];
                
                await contactsApi.updateContact(req.body.email, updateContact);
                res.json({ 
                    success: true, 
                    message: 'Contact updated successfully' 
                });
            } catch (updateError) {
                console.error('Error updating contact:', updateError);
                res.status(500).json({ error: updateError.message });
            }
        } else {
            res.status(500).json({ error: error.message || 'Failed to add contact' });
        }
    }
};

/**
 * Send transactional email via Brevo (Remains unchanged)
 * Sends emails for form submissions, payment receipts, etc.
 */
exports.sendEmail = async (req, res) => {
    try {
        const { to, subject, htmlContent, textContent, sender } = req.body;
        
        if (!to || !subject || !htmlContent) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, and htmlContent are required' 
            });
        }
        
        // Prepare email data
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 
        sendSmtpEmail.to = Array.isArray(to) ? to : [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.textContent = textContent || htmlContent.replace(/<[^>]*>/g, '');
        sendSmtpEmail.sender = sender || {
            name: 'APEH-BE-CHARITY',
            email: 'noreply@apehbe.org'
        };
        
        // Send email
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        res.json({ 
            success: true, 
            messageId: result.messageId,
            message: 'Email sent successfully' 
        });
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to send email' 
        });
    }
};

/**
 * Subscribe to newsletter (Updated to handle all attributes)
 * Adds email to newsletter list in Brevo and database
 */
exports.subscribeNewsletter = async (req, res) => {
    try {
        // Capture all potential fields from the frontend
        const { email, source = 'website', firstName, lastName, ...restAttributes } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Check if already subscribed in database
        let newsletter = await Newsletter.findOne({ email });
        
        if (newsletter && newsletter.status === 'active') {
            return res.json({ 
                success: true, 
                message: 'Already subscribed to newsletter' 
            });
        }
        
        // 1. Prepare Brevo Attributes (MUST be ALL CAPS)
        const brevoAttributes = {
            SOURCE: source,
            SUBSCRIPTION_DATE: new Date().toISOString(),
        };

        // Add standard fields if provided
        if (firstName) brevoAttributes.FIRSTNAME = firstName;
        if (lastName) brevoAttributes.LASTNAME = lastName;

        // Map any remaining attributes (e.g., 'phone', 'zip') to ALL CAPS for Brevo
        for (const [key, value] of Object.entries(restAttributes)) {
            // Only map if the value is non-empty
            if (value && key.toLowerCase() !== 'email') {
                brevoAttributes[key.toUpperCase()] = value;
            }
        }

        // 2. Add/Update Contact in Brevo
        const createContact = new SibApiV3Sdk.CreateContact(); 
        createContact.email = email;
        createContact.attributes = brevoAttributes; // Use the collected attributes
        createContact.listIds = [1]; // Newsletter list ID (assumed list ID 1)
        createContact.updateEnabled = true;
        
        let brevoContactId = null;
        try {
            const result = await contactsApi.createContact(createContact);
            brevoContactId = result.id;
        } catch (brevoError) {
            // If contact already exists (400 error), try to update just the attributes and list status
            if (brevoError.status === 400) {
                try {
                    const updateContact = new SibApiV3Sdk.UpdateContact(); 
                    updateContact.attributes = brevoAttributes; // Update attributes
                    updateContact.listIds = [1]; // Ensure they are on the list
                    
                    await contactsApi.updateContact(email, updateContact);
                } catch (updateError) {
                    console.error('Error updating existing newsletter contact:', updateError);
                }
            } else {
                // Log other critical Brevo errors
                console.error('Critical Brevo Contact creation error:', brevoError);
            }
        }
        
        // 3. Save/Update to MongoDB Database
        // Combine attributes for local storage (optional: only if needed for display/search)
        const allAttributes = { firstName, lastName, ...restAttributes };
        
        if (newsletter) {
            newsletter.status = 'active';
            newsletter.brevo_contact_id = brevoContactId;
            newsletter.source = source;
            newsletter.attributes = allAttributes; // Save local copy of attributes
            await newsletter.save();
        } else {
            newsletter = await Newsletter.create({
                email,
                source,
                status: 'active',
                brevo_contact_id: brevoContactId,
                attributes: allAttributes // Save local copy of attributes
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Successfully subscribed to newsletter' 
        });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to subscribe to newsletter' 
        });
    }
};

/**
 * Submit contact form (Remains unchanged)
 * Saves form submission and sends email notifications
 */
exports.submitContactForm = async (req, res) => {
    try {
        const { fullName, email, inquiryType, message, phone, address, country } = req.body;
        
        if (!fullName || !email || !message) {
            return res.status(400).json({ 
                error: 'Missing required fields: fullName, email, and message are required' 
            });
        }
        
        // Save to database
        const formSubmission = await FormSubmission.create({
            form_type: 'contact',
            submitter: {
                fullName,
                email,
                phone,
                address,
                country
            },
            inquiry_type: inquiryType,
            message,
            status: 'new'
        });
        
        // Send email notification to organization
        const emailSubject = `New Contact Form Submission - ${inquiryType || 'General Inquiry'}`;
        const emailHtml = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Inquiry Type:</strong> ${inquiryType || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;
        
        // Prepare email data for notification
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 
        sendSmtpEmail.to = [{ email: process.env.ADMIN_EMAIL || 'admin@apehbe.org' }];
        sendSmtpEmail.subject = emailSubject;
        sendSmtpEmail.htmlContent = emailHtml;
        sendSmtpEmail.sender = {
            name: 'APEH-BE-CHARITY API',
            email: 'noreply@apehbe.org'
        };

        // Send email notification
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        res.json({ 
            success: true, 
            message: 'Form submitted successfully. We will get back to you soon!' 
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to submit form' 
        });
    }
};