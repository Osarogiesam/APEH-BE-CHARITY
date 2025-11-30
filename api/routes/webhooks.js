/**
 * ===== WEBHOOK ROUTES =====
 * Handles webhooks from payment gateways for payment verification
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

/**
 * Flutterwave webhook
 * Receives payment status updates from Flutterwave
 */
router.post('/flutterwave', express.json(), async (req, res) => {
    try {
        const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
        const signature = req.headers['verif-hash'];
        
        // Verify webhook signature
        if (secretHash && signature !== secretHash) {
            console.error('Invalid Flutterwave webhook signature');
            return res.status(400).send('Invalid signature');
        }
        
        const { event, data } = req.body;
        
        // Handle charge.completed event
        if (event === 'charge.completed' && data.status === 'successful') {
            // Update transaction in database
            await Transaction.updateOne(
                { transaction_id: data.tx_ref },
                { 
                    $set: { 
                        status: 'completed',
                        verified_at: new Date(),
                        transaction_data: data
                    } 
                }
            );
            
            console.log('✅ Flutterwave payment succeeded:', data.tx_ref);
        } else if (event === 'charge.completed' && data.status !== 'successful') {
            // Payment failed
            await Transaction.updateOne(
                { transaction_id: data.tx_ref },
                { 
                    $set: { 
                        status: 'failed',
                        failed_at: new Date(),
                        transaction_data: data
                    } 
                }
            );
            
            console.log('❌ Flutterwave payment failed:', data.tx_ref);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Flutterwave webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Paystack webhook
 * Receives payment status updates from Paystack
 */
router.post('/paystack', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');
        
        if (hash !== req.headers['x-paystack-signature']) {
            console.error('Invalid Paystack webhook signature');
            return res.status(400).send('Invalid signature');
        }
        
        const event = JSON.parse(req.body);
        
        // Handle charge.success event
        if (event.event === 'charge.success') {
            const transaction = event.data;
            
            // Update transaction in database
            await Transaction.updateOne(
                { transaction_id: transaction.reference },
                { 
                    $set: { 
                        status: 'completed',
                        verified_at: new Date(),
                        transaction_data: transaction
                    } 
                }
            );
            
            console.log('✅ Paystack payment succeeded:', transaction.reference);
        } else if (event.event === 'charge.failed') {
            // Payment failed
            const transaction = event.data;
            
            await Transaction.updateOne(
                { transaction_id: transaction.reference },
                { 
                    $set: { 
                        status: 'failed',
                        failed_at: new Date(),
                        transaction_data: transaction
                    } 
                }
            );
            
            console.log('❌ Paystack payment failed:', transaction.reference);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Paystack webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

