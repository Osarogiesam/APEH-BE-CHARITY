/**
 * ===== PAYSTACK PAYMENT CONTROLLER =====
 * Handles Paystack payment initialization and verification
 */

const axios = require('axios');
const Transaction = require('../models/Transaction');

/**
 * Initialize Paystack payment
 * Creates a payment authorization URL for the user
 */
exports.initialize = async (req, res) => {
    try {
        const { amount, currency = 'NGN', email, project, donorInfo } = req.body;
        
        // Validate required fields
        if (!amount || !email || !project) {
            return res.status(400).json({ 
                error: 'Missing required fields: amount, email, and project are required' 
            });
        }
        
        // Generate unique reference
        const reference = `APEH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare Paystack payment request
        const paymentData = {
            email: email,
            amount: parseFloat(amount) * 100, // Convert to kobo (smallest currency unit)
            currency: currency,
            reference: reference,
            metadata: {
                project: project,
                donor_country: donorInfo.country || 'Nigeria',
                custom_fields: [
                    {
                        display_name: 'Project',
                        variable_name: 'project',
                        value: project
                    },
                    {
                        display_name: 'Donor Name',
                        variable_name: 'donor_name',
                        value: donorInfo.name || email.split('@')[0]
                    }
                ]
            },
            callback_url: `${process.env.FRONTEND_URL}/donate.html?status=paystack&ref=${reference}`
        };
        
        // Make request to Paystack API
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Check if initialization was successful
        if (response.data.status) {
            // Save transaction to database
            await Transaction.create({
                transaction_id: reference,
                amount: parseFloat(amount),
                currency: currency,
                payment_method: 'paystack',
                status: 'pending',
                project: project,
                donor: {
                    email: email,
                    name: donorInfo.name || email.split('@')[0],
                    address: donorInfo.address,
                    country: donorInfo.country || 'Nigeria',
                    zipCode: donorInfo.zipCode,
                    phone: donorInfo.phone
                },
                metadata: {
                    paystack_reference: reference,
                    authorization_url: response.data.data.authorization_url
                }
            });
            
            // Return authorization URL to frontend
            res.json({ 
                success: true,
                authorization_url: response.data.data.authorization_url,
                reference: reference,
                message: 'Payment initialized successfully'
            });
        } else {
            throw new Error('Failed to initialize payment with Paystack');
        }
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.message || error.message || 'Failed to initialize payment' 
        });
    }
};

/**
 * Verify Paystack payment
 * Verifies payment status using transaction reference
 */
exports.verify = async (req, res) => {
    try {
        const { reference } = req.body;
        
        if (!reference) {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }
        
        // Verify transaction with Paystack API
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Check if verification was successful
        if (response.data.status && response.data.data.status === 'success') {
            const transaction = response.data.data;
            
            // Update transaction in database
            await Transaction.updateOne(
                { transaction_id: reference },
                { 
                    $set: { 
                        status: 'completed',
                        verified_at: new Date(),
                        transaction_data: transaction
                    } 
                }
            );
            
            res.json({ 
                success: true, 
                transaction: transaction,
                message: 'Payment verified successfully' 
            });
        } else {
            // Payment failed or pending
            const status = response.data.data?.status || 'failed';
            
            // Update transaction status
            await Transaction.updateOne(
                { transaction_id: reference },
                { 
                    $set: { 
                        status: status === 'success' ? 'completed' : 'failed',
                        failed_at: status !== 'success' ? new Date() : null,
                        transaction_data: response.data.data
                    } 
                }
            );
            
            res.status(400).json({ 
                success: false, 
                message: 'Payment verification failed or payment not completed' 
            });
        }
    } catch (error) {
        console.error('Paystack verify error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.message || error.message || 'Failed to verify payment' 
        });
    }
};

