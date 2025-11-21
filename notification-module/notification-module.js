const express = require('express');
const { connectDB } = require('../config/database');
const { Notification } = require('../models/Notification');
const { access: accessLogger, error: errorLogger, debug: debugLogger } = require('../config/logger');

const router = express.Router();

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

// Initialize notifications (for backward compatibility)
const initializeNotificationsFile = async () => {
    try {
        await initializeDB();
        accessLogger.info('Notifications MongoDB connection initialized');
    } catch (error) {
        errorLogger.error('Error initializing notifications:', error);
    }
};

// Read notifications from MongoDB
const readNotifications = async () => {
    try {
        await initializeDB();
        return await Notification.find({}).sort({ createdAt: -1 });
    } catch (error) {
        errorLogger.error('Error reading notifications:', error);
        return [];
    }
};

// Add a notification
const addNotification = async (notification) => {
    try {
        await initializeDB();
        
        // Get next notification ID
        const lastNotification = await Notification.findOne().sort({ id: -1 });
        const nextId = lastNotification ? lastNotification.id + 1 : 1;
        
        const newNotification = new Notification({
            id: nextId,
            ...notification,
            createdAt: new Date()
        });
        
        await newNotification.save();
        return newNotification;
    } catch (error) {
        errorLogger.error('Error adding notification:', error);
        throw error;
    }
};

/**
 * @swagger
 * /v1/notifications:
 *   get:
 *     summary: Get all notifications
 *     description: |
 *       Retrieve all notifications from the system
 *       
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Billing Managers with notification-read permissions
 *       - Internal Microservices (notification-module, billing-module, payments-module)
 *       - API Partners with valid API keys and notification-read permissions
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants attempting to access all notifications (should use tenant-specific filters)
 *       - Service Managers without notification-read permissions
 *       - Insufficient Role Permissions (viewer role without notification access)
 *       - Rate Limit Exceeding Clients (over 1000 requests/hour)
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   type:
 *                     type: string
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 *                   createdAt:
 *                     type: string
 */
router.get('/v1/notifications', async (req, res) => {
    try {
        const notifications = await readNotifications();
        accessLogger.info('Fetching all notifications');
        res.json(notifications);
    } catch (error) {
        errorLogger.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * @swagger
 * /v1/notifications/type/{type}:
 *   get:
 *     summary: Get notifications by type
 *     description: |
 *       Retrieve notifications filtered by type
 *       
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Billing Managers accessing billing-related notification types
 *       - Authenticated Tenants accessing notification types relevant to their account
 *       - Internal Microservices (notification-module, billing-module, payments-module) filtering by type
 *       - API Partners with valid API keys and notification-read permissions
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants attempting to access notification types beyond their scope
 *       - Service Managers without notification-read permissions
 *       - Insufficient Role Permissions for specific notification types
 *       - Expired Session Tokens beyond 24-hour validity period
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification type (e.g., BILL_CREATED, PAYMENT_RECEIVED, TENANT_CREATED)
 *     responses:
 *       200:
 *         description: List of notifications matching the type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No notifications found for the type
 */
router.get('/v1/notifications/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const notifications = await readNotifications();
        const filtered = notifications.filter(n => n.type === type);
        
        accessLogger.info(`Fetching notifications of type: ${type}`);
        
        if (filtered.length === 0) {
            return res.status(404).json({ error: 'No notifications found for this type' });
        }
        
        res.json(filtered);
    } catch (error) {
        errorLogger.error('Error fetching notifications by type:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * @swagger
 * /v1/notifications:
 *   post:
 *     summary: Create a notification (Internal Use)
 *     description: |
 *       Create a new notification in the system
 *       
 *       **WHO CAN USE:**
 *       - Internal Microservices (notification-module, billing-module, payments-module, auth-module, service-module)
 *       - System Administrators with admin role credentials
 *       - Authorized notification systems with valid API credentials
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens or API key authentication headers
 *       - Authenticated Tenants attempting to create notifications
 *       - Billing Managers without notification-create permissions
 *       - Service Managers without notification-create permissions
 *       - API Partners without explicit notification-creation permissions
 *       - Insufficient Role Permissions (non-admin roles without notification-create)
 *       - Requests missing required fields (type, message)
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/v1/notifications', async (req, res) => {
    try {
        const { type, message, data } = req.body;
        
        if (!type || !message) {
            return res.status(400).json({ error: 'type and message are required' });
        }
        
        const notification = await addNotification({ type, message, data: data || {} });
        accessLogger.info(`Notification created: ${type} - ${message}`);
        
        res.status(201).json(notification);
    } catch (error) {
        errorLogger.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

/**
 * @swagger
 * /v1/notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     description: |
 *       Retrieve a specific notification
 *       
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Billing Managers with notification-read permissions
 *       - Authenticated Tenants accessing their own notification
 *       - Internal Microservices (notification-module, billing-module, payments-module)
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants attempting to access other tenants' notifications
 *       - Service Managers without notification-read permissions
 *       - Insufficient Role Permissions for cross-tenant notification access
 *       - Expired Session Tokens beyond 24-hour validity period
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Notification found
 *       404:
 *         description: Notification not found
 */
router.get('/v1/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notifications = await readNotifications();
        const notification = notifications.find(n => n.id == id);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        accessLogger.info(`Fetching notification: ${id}`);
        res.json(notification);
    } catch (error) {
        errorLogger.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Failed to fetch notification' });
    }
});

module.exports = {
    router,
    addNotification,
    initializeNotificationsFile
};
