const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/database');
const { Bill } = require('../models/Bill');
const { getAllServices } = require('../service-module/service-module');
const { addNotification } = require('../notification-module/notification-module');

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

// Load bills from MongoDB
const loadBills = async () => {
    try {
        await initializeDB();
        return await Bill.find({}).sort({ id: 1 });
    } catch (error) {
        console.error('Error loading bills:', error);
        return [];
    }
};

/**
 * @swagger
 * /v1/bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - tenantId
 *               - hours
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 description: ID of the service
 *               tenantId:
 *                 type: integer
 *                 description: ID of the tenant
 *               hours:
 *                 type: number
 *                 description: Number of hours of service
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/v1/bills', async (req, res) => {
    try {
        await initializeDB();
        
        const { serviceId, tenantId, hours } = req.body;

        // Validate required fields
        if (!serviceId || !hours) {
            return res.status(400).json({ error: 'serviceId and hours are required' });
        }

        // Load services to get price per hour
        const services = await getAllServices();
        const service = services.find(s => s.id === parseInt(serviceId));
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Calculate bill amount
        const billAmount = service.pricePerHour * hours;

        // Get next bill ID
        const lastBill = await Bill.findOne().sort({ id: -1 });
        const nextId = lastBill ? lastBill.id + 1 : 1;

        // Create new bill
        const newBill = new Bill({
            id: nextId,
            serviceId: parseInt(serviceId),
            tenantId: tenantId ? parseInt(tenantId) : null,
            billAmount,
            hours,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        });

        // Save to MongoDB
        await newBill.save();

        // Send notification
        try {
            await addNotification({
                type: 'BILL_CREATED',
                message: `Bill #${newBill.id} created for tenant #${newBill.tenantId}`,
                data: {
                    billId: newBill.id,
                    tenantId: newBill.tenantId,
                    serviceId: newBill.serviceId,
                    amount: newBill.billAmount,
                    hours: newBill.hours
                }
            });
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the request if notification fails
        }

        res.status(201).json(newBill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/bills:
 *   get:
 *     summary: Get all bills
 *     tags: [Bills]
 *     responses:
 *       200:
 *         description: List of all bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 */
router.get('/v1/bills', async (req, res) => {
    try {
        const bills = await loadBills();
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/bills/{billId}:
 *   get:
 *     summary: Get bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       404:
 *         description: Bill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/bills/:billId', async (req, res) => {
    try {
        await initializeDB();
        const bill = await Bill.findOne({ id: parseInt(req.params.billId) });

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{tenantId}/bills:
 *   get:
 *     summary: Get all bills for a specific tenant
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: List of tenant's bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 *       404:
 *         description: No bills found for tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/tenants/:tenantId/bills', async (req, res) => {
    try {
        await initializeDB();
        const tenantBills = await Bill.find({ tenantId: parseInt(req.params.tenantId) }).sort({ id: 1 });

        if (tenantBills.length === 0) {
            return res.status(404).json({ error: 'No bills found for this tenant' });
        }

        res.json(tenantBills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router
};
