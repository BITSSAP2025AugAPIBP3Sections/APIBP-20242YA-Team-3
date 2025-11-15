const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/database');
const { Bill } = require('../models/Bill');
const { addNotification } = require('../notification-module/notification-module');

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

/**
 * @swagger
 * /v1/payment:
 *   post:
 *     summary: Update bill payment status
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billId
 *               - status
 *             properties:
 *               billId:
 *                 type: integer
 *                 description: ID of the bill to update
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled]
 *                 description: New payment status
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bill:
 *                   $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid input or status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/v1/payment', async (req, res) => {
    try {
        const { billId, status } = req.body;

        // Validate required fields
        if (!billId || !status) {
            return res.status(400).json({ error: 'billId and status are required' });
        }

        // Validate status value
        const validStatuses = ['pending', 'paid', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Status must be one of: pending, paid, cancelled'
            });
        }

        await initializeDB();

        // Find and update the bill
        const bill = await Bill.findOne({ id: parseInt(billId) });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        const previousStatus = bill.status;
        // Update status
        bill.status = status;

        // Save to MongoDB
        await bill.save();

        // Create notification
        try {
            await addNotification({
                type: 'PAYMENT_STATUS_UPDATED',
                message: `Bill #${billId} status updated from ${previousStatus} to ${status}`,
                data: {
                    billId: bill.id,
                    tenantId: bill.tenantId,
                    previousStatus,
                    newStatus: status,
                    amount: bill.billAmount
                }
            });
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the request if notification fails
        }

        res.json({
            message: 'Payment status updated successfully',
            bill
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = {
    router
};
