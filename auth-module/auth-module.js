const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Load tenants from tenants.json
const loadTenants = () => {
    try {
        const tenantsPath = path.join(__dirname, '..', 'tenants.json');
        const tenantsData = fs.readFileSync(tenantsPath, 'utf8');
        return JSON.parse(tenantsData);
    } catch (error) {
        console.error('Error loading tenants:', error);
        return [];
    }
};

// Save tenants to tenants.json
const saveTenants = (tenants) => {
    try {
        const tenantsPath = path.join(__dirname, '..', 'tenants.json');
        fs.writeFileSync(tenantsPath, JSON.stringify(tenants, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving tenants:', error);
        return false;
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
router.post('/v1/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const tenants = loadTenants();
        const tenant = tenants.find(t => t.email === email && t.password === password);

        if (!tenant) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Don't send password in response
        const { password: _, ...tenantWithoutPassword } = tenant;
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
router.get('/v1/tenants', (req, res) => {
    try {
        const tenants = loadTenants();
        // Remove passwords from response
        const tenantsWithoutPasswords = tenants.map(({ password, ...rest }) => rest);
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
router.get('/v1/tenants/:id', (req, res) => {
    try {
        const tenants = loadTenants();
        const tenant = tenants.find(t => t.id === parseInt(req.params.id));

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Remove password from response
        const { password, ...tenantWithoutPassword } = tenant;
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
router.post('/v1/tenants', (req, res) => {
    try {
        const { name, address, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !address || !email || !phone || !password) {
            return res.status(400).json({ 
                error: 'Name, address, email, phone, and password are required' 
            });
        }

        const tenants = loadTenants();

        // Check if email already exists
        if (tenants.some(t => t.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new tenant
        const newTenant = {
            id: tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1,
            name,
            address,
            email,
            phone,
            password
        };

        tenants.push(newTenant);

        if (!saveTenants(tenants)) {
            return res.status(500).json({ error: 'Error saving tenant' });
        }

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = newTenant;
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
router.put('/v1/tenants/:id', (req, res) => {
    try {
        const { name, address, email, phone, password } = req.body;
        const tenantId = parseInt(req.params.id);

        // Validate required fields
        if (!name || !address || !email || !phone) {
            return res.status(400).json({ 
                error: 'Name, address, email, and phone are required' 
            });
        }

        const tenants = loadTenants();
        const tenantIndex = tenants.findIndex(t => t.id === tenantId);

        if (tenantIndex === -1) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if email exists for other tenants
        if (tenants.some(t => t.email === email && t.id !== tenantId)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Update tenant
        tenants[tenantIndex] = {
            ...tenants[tenantIndex],
            name,
            address,
            email,
            phone,
            // Only update password if provided
            ...(password && { password })
        };

        if (!saveTenants(tenants)) {
            return res.status(500).json({ error: 'Error saving tenant' });
        }

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = tenants[tenantIndex];
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
router.delete('/v1/tenants/:id', (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const tenants = loadTenants();
        const tenantIndex = tenants.findIndex(t => t.id === tenantId);

        if (tenantIndex === -1) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Remove tenant
        tenants.splice(tenantIndex, 1);

        if (!saveTenants(tenants)) {
            return res.status(500).json({ error: 'Error deleting tenant' });
        }

        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    router
};
