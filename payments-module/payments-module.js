const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

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
router.post('/v1/payment', (req, res) => {
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

        // Load bills
        const billsPath = path.join(__dirname, '..', 'bills.json');
        const bills = JSON.parse(fs.readFileSync(billsPath, 'utf8'));

        // Find and update the bill
        const bill = bills.find(b => b.id === parseInt(billId));
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Update status
        bill.status = status;

        // Save back to file
        fs.writeFileSync(billsPath, JSON.stringify(bills, null, 2));

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
