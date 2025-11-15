const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/database');
const { Tenant } = require('../models/Tenant');

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

// Load tenants from MongoDB
const loadTenants = async () => {
    try {
        await initializeDB();
        return await Tenant.find({}).sort({ id: 1 });
    } catch (error) {
        console.error('Error loading tenants:', error);
        return [];
    }
};

// Save tenant to MongoDB
const saveTenant = async (tenantData) => {
    try {
        await initializeDB();
        
        // Get next tenant ID
        const lastTenant = await Tenant.findOne().sort({ id: -1 });
        const nextId = lastTenant ? lastTenant.id + 1 : 1;
        
        const tenant = new Tenant({
            ...tenantData,
            id: nextId
        });
        
        await tenant.save();
        return tenant;
    } catch (error) {
        console.error('Error saving tenant:', error);
        return null;
    }
};

/**
 * @swagger
 * /v1/login:
 *   post:
 *     summary: Authenticate a tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/v1/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        await initializeDB();
        const tenant = await Tenant.findOne({ email: email, password: password });

        if (!tenant) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Don't send password in response
        const { password: _, ...tenantWithoutPassword } = tenant.toObject();
        res.json(tenantWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: List of all tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 */
router.get('/v1/tenants', async (req, res) => {
    try {
        const tenants = await loadTenants();
        // Remove passwords from response
        const tenantsWithoutPasswords = tenants.map(tenant => {
            const { password, ...rest } = tenant.toObject();
            return rest;
        });
        res.json(tenantsWithoutPasswords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/tenants/:id', async (req, res) => {
    try {
        await initializeDB();
        const tenant = await Tenant.findOne({ id: parseInt(req.params.id) });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Remove password from response
        const { password, ...tenantWithoutPassword } = tenant.toObject();
        res.json(tenantWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantWithPassword'
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/v1/tenants', async (req, res) => {
    try {
        const { name, address, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !address || !email || !phone || !password) {
            return res.status(400).json({ 
                error: 'Name, address, email, phone, and password are required' 
            });
        }

        await initializeDB();

        // Check if email already exists
        const existingTenant = await Tenant.findOne({ email: email });
        if (existingTenant) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new tenant
        const newTenant = await saveTenant({
            name,
            address,
            email,
            phone,
            password
        });

        if (!newTenant) {
            return res.status(500).json({ error: 'Error saving tenant' });
        }

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = newTenant.toObject();
        res.status(201).json(tenantWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{id}:
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantWithPassword'
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/v1/tenants/:id', async (req, res) => {
    try {
        const { name, address, email, phone, password } = req.body;
        const tenantId = parseInt(req.params.id);

        // Validate required fields
        if (!name || !address || !email || !phone) {
            return res.status(400).json({ 
                error: 'Name, address, email, and phone are required' 
            });
        }

        await initializeDB();
        
        // Find the tenant to update
        const tenant = await Tenant.findOne({ id: tenantId });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if email exists for other tenants
        const existingTenant = await Tenant.findOne({ email: email, id: { $ne: tenantId } });
        if (existingTenant) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Update tenant
        tenant.name = name;
        tenant.address = address;
        tenant.email = email;
        tenant.phone = phone;
        if (password) {
            tenant.password = password;
        }

        await tenant.save();

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = tenant.toObject();
        res.json(tenantWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{id}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/v1/tenants/:id', async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        
        await initializeDB();
        
        const result = await Tenant.deleteOne({ id: tenantId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router
};
