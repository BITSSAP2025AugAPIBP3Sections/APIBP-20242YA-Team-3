const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Read and parse the Services.json file
const loadServices = () => {
    try {
        const servicesPath = path.join(__dirname, '..', 'Services.json');
        const servicesData = fs.readFileSync(servicesPath, 'utf8');
        const servicesJson = JSON.parse(servicesData);
        
        // Transform the data into a flat list of services
        const allServices = [];
        
        servicesJson.services.forEach(category => {
            category.subServices.forEach(subService => {
                subService.services.forEach(service => {
                    allServices.push({
                        id: service.id,
                        name: service.name,
                        pricePerHour: service.pricePerHour,
                        categoryId: category.id,
                        categoryName: category.category,
                        subServiceId: subService.id,
                        subServiceName: subService.name
                    });
                });
            });
        });
        
        return allServices;
    } catch (error) {
        console.error('Error loading services:', error);
        return [];
    }
};

// API Routes
/**
 * @swagger
 * /v1/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter services by category name
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter services by service name
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/v1/services', (req, res) => {
    try {
        const services = loadServices();
        
        // Apply filters if provided
        let filteredServices = services;
        if (req.query.category) {
            filteredServices = filteredServices.filter(service => 
                service.categoryName.toLowerCase() === req.query.category.toLowerCase()
            );
        }
        if (req.query.name) {
            filteredServices = filteredServices.filter(service => 
                service.name.toLowerCase().includes(req.query.name.toLowerCase())
            );
        }
        
        res.json(filteredServices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/services/:serviceId', (req, res) => {
    try {
        const services = loadServices();
        const service = services.find(s => s.id === parseInt(req.params.serviceId));
        
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - subServiceId
 *               - name
 *               - pricePerHour
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               subServiceId:
 *                 type: integer
 *                 description: Sub-service ID
 *               name:
 *                 type: string
 *                 description: Service name
 *               pricePerHour:
 *                 type: number
 *                 description: Price per hour
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input or category/subService not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/v1/services', (req, res) => {
    try {
        const servicesPath = path.join(__dirname, '..', 'Services.json');
        const servicesJson = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
        
        const { categoryId, subServiceId, name, pricePerHour } = req.body;
        
        // Find the category and subService
        const category = servicesJson.services.find(c => c.id === categoryId);
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        
        const subService = category.subServices.find(s => s.id === subServiceId);
        if (!subService) {
            return res.status(400).json({ error: 'SubService not found' });
        }
        
        // Create new service
        const newService = {
            id: Math.max(...subService.services.map(s => s.id)) + 1,
            name,
            pricePerHour
        };
        
        // Add to services array
        subService.services.push(newService);
        
        // Save back to file
        fs.writeFileSync(servicesPath, JSON.stringify(servicesJson, null, 2));
        
        res.status(201).json({
            ...newService,
            categoryId: category.id,
            categoryName: category.category,
            subServiceId: subService.id,
            subServiceName: subService.name
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/services/{serviceId}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name
 *               pricePerHour:
 *                 type: number
 *                 description: Price per hour
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/v1/services/:serviceId', (req, res) => {
    try {
        const servicesPath = path.join(__dirname, '..', 'Services.json');
        const servicesJson = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
        
        let updatedService = null;
        const serviceId = parseInt(req.params.serviceId);
        
        // Find and update the service
        servicesJson.services.forEach(category => {
            category.subServices.forEach(subService => {
                const serviceIndex = subService.services.findIndex(s => s.id === serviceId);
                if (serviceIndex !== -1) {
                    // Update the service
                    subService.services[serviceIndex].name = req.body.name || subService.services[serviceIndex].name;
                    subService.services[serviceIndex].pricePerHour = req.body.pricePerHour || subService.services[serviceIndex].pricePerHour;
                    
                    updatedService = {
                        ...subService.services[serviceIndex],
                        categoryId: category.id,
                        categoryName: category.category,
                        subServiceId: subService.id,
                        subServiceName: subService.name
                    };
                }
            });
        });
        
        if (!updatedService) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        // Save back to file
        fs.writeFileSync(servicesPath, JSON.stringify(servicesJson, null, 2));
        
        res.json(updatedService);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/services/{serviceId}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/v1/services/:serviceId', (req, res) => {
    try {
        const servicesPath = path.join(__dirname, '..', 'Services.json');
        const servicesJson = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
        
        const serviceId = parseInt(req.params.serviceId);
        let serviceDeleted = false;
        
        // Find and delete the service
        servicesJson.services.forEach(category => {
            category.subServices.forEach(subService => {
                const serviceIndex = subService.services.findIndex(s => s.id === serviceId);
                if (serviceIndex !== -1) {
                    subService.services.splice(serviceIndex, 1);
                    serviceDeleted = true;
                }
            });
        });
        
        if (!serviceDeleted) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        // Save back to file
        fs.writeFileSync(servicesPath, JSON.stringify(servicesJson, null, 2));
        
        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/services/{serviceId}/price-estimate:
 *   get:
 *     summary: Get price estimate for a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Price estimate for the service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 basePrice:
 *                   type: number
 *                   description: Base price per hour
 *                 estimatedPrice:
 *                   type: number
 *                   description: Estimated price
 *                 currency:
 *                   type: string
 *                   description: Currency code
 *                 serviceId:
 *                   type: integer
 *                   description: Service ID
 *                 serviceName:
 *                   type: string
 *                   description: Service name
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/v1/services/:serviceId/price-estimate', (req, res) => {
    try {
        const services = loadServices();
        const service = services.find(s => s.id === parseInt(req.params.serviceId));
        
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
        // Simple price estimate - just return the base price per hour
        res.json({
            basePrice: service.pricePerHour,
            estimatedPrice: service.pricePerHour,
            currency: 'USD',
            serviceId: service.id,
            serviceName: service.name
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of service categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Category ID
 *                   name:
 *                     type: string
 *                     description: Category name
 *                   subServices:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Sub-service ID
 *                         name:
 *                           type: string
 *                           description: Sub-service name
 */
router.get('/v1/categories', (req, res) => {
    try {
        const servicesPath = path.join(__dirname, '..', 'Services.json');
        const servicesJson = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
        
        const categories = servicesJson.services.map(category => ({
            id: category.id,
            name: category.category,
            subServices: category.subServices.map(sub => ({
                id: sub.id,
                name: sub.name
            }))
        }));
        
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router and loadServices function
module.exports = {
    getAllServices: loadServices,
    router
};

const app = express();
app.use(router);

app.listen(5000,()=>{
    console.log('Service module running on port 5000');
});