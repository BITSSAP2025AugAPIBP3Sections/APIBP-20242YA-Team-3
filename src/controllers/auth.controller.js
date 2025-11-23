const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { connectDB } = require('../config/database');
const { Tenant } = require('../models/Tenant');
const { generateToken, authenticateToken, requireOwnerOrAdmin, requireAdmin } = require('../middleware/auth.middleware');

const SALT_ROUNDS = 10; // For bcrypt password hashing

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
 *     description: |
 *       **WHO CAN USE:**
 *       - Registered Tenants with valid email and password credentials
 *       - Organizations with active tenant accounts
 *       
 *       **WHO CANNOT USE:**
 *       - Unregistered accounts without completed registration
 *       - Suspended Tenants with 'suspended' or 'terminated' status
 *       - Accounts with incorrect email/password combinations
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
        
        // Find tenant by email only (don't include password in query)
        const tenant = await Tenant.findOne({ email: email });

        if (!tenant) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, tenant.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken({
            tenantId: tenant.id,
            email: tenant.email,
            name: tenant.name,
            role: tenant.role || 'user' // Default role is 'user', admins have 'admin'
        });

        // Don't send password in response
        const { password: _, ...tenantWithoutPassword } = tenant.toObject();
        
        res.json({
            ...tenantWithoutPassword,
            token // Send JWT token to client
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants:
 *   get:
 *     summary: Get all tenants
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Internal Microservices (auth-module, billing-module, notification-module, payments-module, service-module)
 *       - API Partners with valid API keys and read permissions
 *       
 *       **WHO CANNOT USE:**
 *       - Unauthenticated Requests without valid JWT tokens or API key authentication
 *       - Regular Tenants without admin privileges
 *       - Billing Managers without tenant-read permissions
 *       - Revoked or Expired API Keys
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/v1/tenants', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await initializeDB();
        console.log('Fetching all tenants from database...');
        
        const tenants = await Tenant.find({}).select('-password').sort({ id: 1 });
        
        console.log(`Found ${tenants.length} tenant(s) in database`);
        
        if (tenants.length === 0) {
            console.log('No tenants found in database');
            return res.json([]); // Return empty array instead of error
        }
        
        // Convert to plain objects
        const tenantsArray = tenants.map(tenant => tenant.toObject());
        
        console.log('Returning tenants:', tenantsArray.map(t => ({ id: t.id, name: t.name, email: t.email })));
        
        res.json(tenantsArray);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Authenticated Tenants accessing their own account information
 *       - Billing Managers with tenant-read permissions
 *       - Internal Microservices requiring tenant details for processing
 *       
 *       **WHO CANNOT USE:**
 *       - Unauthenticated Requests without valid JWT tokens
 *       - Authenticated Tenants attempting to access other tenants' information
 *       - Suspended Tenants with 'suspended' or 'terminated' account status
 *       - Expired Session Tokens
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own data
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/tenants/:id', authenticateToken, requireOwnerOrAdmin, async (req, res) => {
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
 *     description: |
 *       **WHO CAN USE:**
 *       - Public Registration Endpoints for new organizations/individuals
 *       - System Administrators creating tenant accounts
 *       - API Partners with tenant-creation permissions
 *       - Internal Microservices during automated onboarding processes
 *       
 *       **WHO CANNOT USE:**
 *       - Requests attempting to register with existing email addresses
 *       - Invalid or incomplete registration data
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
        const { name, email, phone, password, companyName, billingAddress, status } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ 
                error: 'Name, email, phone, and password are required' 
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long' 
            });
        }

        await initializeDB();

        // Check if email already exists
        const existingTenant = await Tenant.findOne({ email: email });
        if (existingTenant) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new tenant with all provided fields
        const tenantData = {
            name,
            email,
            phone,
            password: hashedPassword, // Store hashed password
            address: billingAddress || '', // Use billingAddress as address
            companyName: companyName || '',
            status: status || 'active',
            role: 'user' // Default role for new signups
        };

        const newTenant = await saveTenant(tenantData);

        if (!newTenant) {
            return res.status(500).json({ error: 'Error saving tenant' });
        }

        // Generate JWT token for auto-login after signup
        const token = generateToken({
            tenantId: newTenant.id,
            email: newTenant.email,
            name: newTenant.name,
            role: newTenant.role || 'user'
        });

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = newTenant.toObject();
        
        res.status(201).json({
            ...tenantWithoutPassword,
            token // Send JWT token to client
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/admin:
 *   post:
 *     summary: Create an admin user
 *     description: |
 *       Creates a new tenant with admin privileges. This endpoint requires either:
 *       1. An existing admin's JWT token (for creating additional admins), OR
 *       2. A special setup key (only for creating the first admin)
 *       
 *       **WHO CAN USE:**
 *       - Existing System Administrators (requires valid admin JWT token)
 *       - Setup Process (requires ADMIN_SETUP_KEY environment variable on first use only)
 *       
 *       **WHO CANNOT USE:**
 *       - Regular users without admin privileges
 *       - Unauthenticated requests (unless using valid setup key for first admin)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               companyName:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *               setupKey:
 *                 type: string
 *                 description: Required only for creating the first admin (must match ADMIN_SETUP_KEY env variable)
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Invalid input or email already exists
 *       401:
 *         description: Unauthorized - Invalid setup key or missing admin token
 *       403:
 *         description: Forbidden - Admin privileges required
 */
router.post('/v1/tenants/admin', async (req, res) => {
    try {
        const { name, email, phone, password, companyName, billingAddress, setupKey } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ 
                error: 'Name, email, phone, and password are required' 
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long' 
            });
        }

        await initializeDB();

        // Check if any admin exists
        const existingAdmin = await Tenant.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            // If admins exist, require authentication from an existing admin
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ 
                    error: 'Admin authentication required to create additional admins' 
                });
            }

            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
                
                if (decoded.role !== 'admin') {
                    return res.status(403).json({ 
                        error: 'Admin privileges required to create admin users' 
                    });
                }
            } catch (err) {
                return res.status(401).json({ 
                    error: 'Invalid or expired token' 
                });
            }
        } else {
            // First admin - require setup key
            const requiredSetupKey = process.env.ADMIN_SETUP_KEY || 'default-setup-key-change-me';
            
            if (setupKey !== requiredSetupKey) {
                return res.status(401).json({ 
                    error: 'Invalid setup key for first admin creation' 
                });
            }
        }

        // Check if email already exists
        const existingTenant = await Tenant.findOne({ email: email });
        if (existingTenant) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new admin tenant
        const tenantData = {
            name,
            email,
            phone,
            password: hashedPassword,
            address: billingAddress || '',
            companyName: companyName || '',
            status: 'active',
            role: 'admin' // Set role to admin
        };

        const newTenant = await saveTenant(tenantData);

        if (!newTenant) {
            return res.status(500).json({ error: 'Error saving admin tenant' });
        }

        // Generate JWT token for auto-login after signup
        const token = generateToken({
            tenantId: newTenant.id,
            email: newTenant.email,
            name: newTenant.name,
            role: 'admin'
        });

        // Remove password from response
        const { password: _, ...tenantWithoutPassword } = newTenant.toObject();
        
        res.status(201).json({
            ...tenantWithoutPassword,
            token // Send JWT token to client
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/tenants/{id}:
 *   put:
 *     summary: Update a tenant
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Authenticated Tenants updating their own account information
 *       - Internal Microservices performing tenant data synchronization
 *       
 *       **WHO CANNOT USE:**
 *       - Unauthenticated Requests without valid JWT tokens
 *       - Authenticated Tenants attempting to modify other tenants' accounts
 *       - Suspended Tenants with 'suspended' or 'terminated' status
 *       - Requests attempting to change email to an already registered address
 *       - Insufficient Role Permissions
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
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials and delete permissions
 *       - Internal Microservices executing account closure workflows
 *       
 *       **WHO CANNOT USE:**
 *       - Unauthenticated Requests without valid JWT tokens
 *       - Regular Tenants attempting to delete accounts
 *       - Billing Managers without administrative delete privileges
 *       - Service Managers lacking tenant management permissions
 *       - API Partners without explicit tenant-deletion permissions
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
