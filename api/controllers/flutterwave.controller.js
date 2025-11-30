/**
 * ===== FLUTTERWAVE PAYMENT CONTROLLER =====
 * Handles Flutterwave payment initialization and verification
 */

const axios = require('axios');
const Transaction = require('../models/Transaction');

const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

/**
 * Initialize Flutterwave payment
 * Creates a payment link for the user to complete payment
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
        
        // Generate unique transaction reference
        const tx_ref = `APEH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare Flutterwave payment request
        const paymentData = {
            tx_ref: tx_ref,
            amount: parseFloat(amount),
            currency: currency,
            payment_options: 'card,account,ussd,mobilemoney,banktransfer',
            redirect_url: `${process.env.FRONTEND_URL}/donate.html?status=flutterwave&tx_ref=${tx_ref}`,
            customer: {
                email: email,
                name: donorInfo.name || email.split('@')[0],
                phone_number: donorInfo.phone || ''
            },
            customizations: {
                title: 'APEH-BE-CHARITY Donation',
                description: `Donation for ${project}`,
                logo: `${process.env.FRONTEND_URL}/logo.png`
            },
            meta: {
                project: project,
                donor_country: donorInfo.country || 'Nigeria'
            }
        };
        
        // Make request to Flutterwave API
        const response = await axios.post(
            `${FLUTTERWAVE_API_URL}/payments`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Check if payment initialization was successful
        if (response.data.status === 'success') {
            // Save transaction to database
            await Transaction.create({
                transaction_id: tx_ref,
                amount: parseFloat(amount),
                currency: currency,
                payment_method: 'flutterwave',
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
                    flutterwave_tx_ref: tx_ref,
                    payment_url: response.data.data.link
                }
            });
            
            // Return payment URL to frontend
            res.json({ 
                success: true,
                payment_url: response.data.data.link,
                tx_ref: tx_ref,
                message: 'Payment initialized successfully'
            });
        } else {
            throw new Error('Failed to initialize payment with Flutterwave');
        }
    } catch (error) {
        console.error('Flutterwave initialization error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.message || error.message || 'Failed to initialize payment' 
        });
    }
};

/**
 * Verify Flutterwave payment
 * Verifies payment status after user completes payment
 */
exports.verify = async (req, res) => {
    try {
        const { tx_ref, reference, transaction_id } = req.body;
        const providedReference = tx_ref || reference;
        
        if (!providedReference && !transaction_id) {
            return res.status(400).json({ error: 'Transaction reference or ID is required' });
        }
        
        const headers = {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
        };
        
        let response;
        if (providedReference) {
            response = await axios.get(
                `${FLUTTERWAVE_API_URL}/transactions/verify_by_reference`,
                {
                    params: { tx_ref: providedReference },
                    headers
                }
            );
        } else {
            response = await axios.get(
                `${FLUTTERWAVE_API_URL}/transactions/${transaction_id}/verify`,
                { headers }
            );
        }
        
        const transaction = response.data?.data;
        
        if (response.data.status === 'success' && transaction?.status === 'successful') {
            const txRefToStore = transaction.tx_ref || providedReference || transaction_id;
            
            await Transaction.updateOne(
                { transaction_id: txRefToStore },
                { 
                    $set: { 
                        status: 'completed',
                        verified_at: new Date(),
                        transaction_data: transaction
                    } 
                }
            );
            
            return res.json({ 
                success: true, 
                transaction,
                message: 'Payment verified successfully' 
            });
        }
        
        const txRefToUpdate = transaction?.tx_ref || providedReference || transaction_id;
        await Transaction.updateOne(
            { transaction_id: txRefToUpdate },
            { 
                $set: { 
                    status: transaction?.status || 'failed',
                    failed_at: transaction?.status === 'successful' ? null : new Date(),
                    transaction_data: transaction
                } 
            }
        );
        
        return res.status(400).json({ 
            success: false, 
            message: 'Payment verification failed or payment not completed' 
        });
    } catch (error) {
        console.error('Flutterwave verify error:', error.response?.data || error.message);
        
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Failed to verify payment';
        
        res.status(status).json({ 
            success: false,
            error: message
        });
    }
};
