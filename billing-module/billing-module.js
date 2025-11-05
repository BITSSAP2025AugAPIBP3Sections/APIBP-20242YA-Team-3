const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const { getAllServices } = require('../service-module/service-module');

// Load bills from bills.json
const loadBills = () => {
    try {
        const billsPath = path.join(__dirname, '..', 'bills.json');
        const billsData = fs.readFileSync(billsPath, 'utf8');
        return JSON.parse(billsData);
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
router.post('/v1/bills', (req, res) => {
    try {
        const { serviceId, tenantId, hours } = req.body;

        // Validate required fields
        if (!serviceId || !tenantId || !hours) {
            return res.status(400).json({ error: 'serviceId, tenantId, and hours are required' });
        }

        // Load services to get price per hour
        const services = getAllServices();
        const service = services.find(s => s.id === parseInt(serviceId));
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Calculate bill amount
        const billAmount = service.pricePerHour * hours;

        // Load existing bills
        const bills = loadBills();

        // Create new bill
        const newBill = {
            id: bills.length > 0 ? Math.max(...bills.map(b => b.id)) + 1 : 1,
            serviceId: parseInt(serviceId),
            tenantId: parseInt(tenantId),
            billAmount,
            hours,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        // Add to bills array
        bills.push(newBill);

        // Save back to file
        const billsPath = path.join(__dirname, '..', 'bills.json');
        fs.writeFileSync(billsPath, JSON.stringify(bills, null, 2));

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
router.get('/v1/bills', (req, res) => {
    try {
        const bills = loadBills();
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
router.get('/v1/bills/:billId', (req, res) => {
    try {
        const bills = loadBills();
        const bill = bills.find(b => b.id === parseInt(req.params.billId));

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
router.get('/v1/tenants/:tenantId/bills', (req, res) => {
    try {
        const bills = loadBills();
        const tenantBills = bills.filter(b => b.tenantId === parseInt(req.params.tenantId));

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
