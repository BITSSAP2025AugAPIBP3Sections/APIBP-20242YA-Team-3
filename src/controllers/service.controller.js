const { gql } = require('apollo-server-express');
const express = require('express');
const { connectDB } = require('../config/database');
const { Category } = require('../models/Service');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// ============================================================================
// DATA LOADING
// ============================================================================

// ============================================================================
// DATA LOADING
// ============================================================================

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

const loadServices = async () => {
    try {
        await initializeDB();
        
        const categories = await Category.find({});
        
        // Transform the data into a flat list of services
        const allServices = [];
        
        categories.forEach(category => {
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

const loadServicesJson = async () => {
    try {
        await initializeDB();
        const categories = await Category.find({});
        return { services: categories };
    } catch (error) {
        console.error('Error loading services.json:', error);
        return { services: [] };
    }
};

// ============================================================================
// GRAPHQL SCHEMA WITH INTROSPECTION
// ============================================================================

const typeDefs = gql`
    """
    Service type representing a service offering in the system.
    This type includes pricing, categorization, and hierarchical information.
    """
    type Service {
        """
        Unique identifier for the service
        """
        id: Int!
        
        """
        Human-readable name of the service
        """
        name: String!
        
        """
        Hourly rate for the service in USD
        """
        pricePerHour: Float!
        
        """
        Unique identifier of the parent category
        """
        categoryId: Int!
        
        """
        Name of the parent category
        """
        categoryName: String!
        
        """
        Unique identifier of the parent sub-service
        """
        subServiceId: Int!
        
        """
        Name of the parent sub-service
        """
        subServiceName: String!
    }

    """
    Category type representing a service category containing sub-services.
    """
    type Category {
        """
        Unique identifier for the category
        """
        id: Int!
        
        """
        Category name
        """
        name: String!
        
        """
        List of sub-services in this category
        """
        subServices: [SubService!]!
    }

    """
    SubService type representing a sub-category containing services.
    """
    type SubService {
        """
        Unique identifier for the sub-service
        """
        id: Int!
        
        """
        Sub-service name
        """
        name: String!
    }

    """
    PriceEstimate type providing pricing information for a service.
    """
    type PriceEstimate {
        """
        Base price per hour
        """
        basePrice: Float!
        
        """
        Estimated total price
        """
        estimatedPrice: Float!
        
        """
        Currency code (ISO 4217)
        """
        currency: String!
        
        """
        Associated service ID
        """
        serviceId: Int!
        
        """
        Associated service name
        """
        serviceName: String!
    }

    """
    Response type for deletion operations.
    """
    type DeleteResponse {
        """
        Whether the operation was successful
        """
        success: Boolean!
        
        """
        Response message
        """
        message: String!
    }

    """
    Input type for creating a new service.
    """
    input ServiceInput {
        """
        Category ID for the service
        """
        categoryId: Int!
        
        """
        Sub-service ID for the service
        """
        subServiceId: Int!
        
        """
        Service name
        """
        name: String!
        
        """
        Price per hour in USD
        """
        pricePerHour: Float!
    }

    """
    Input type for updating an existing service.
    """
    input UpdateServiceInput {
        """
        Updated service name
        """
        name: String
        
        """
        Updated price per hour
        """
        pricePerHour: Float
    }

    """
    Input type for creating a new category.
    """
    input CategoryInput {
        """
        Category name
        """
        name: String!
    }

    """
    Input type for creating a new subcategory.
    """
    input SubCategoryInput {
        """
        Parent category ID
        """
        categoryId: Int!
        
        """
        SubCategory name
        """
        name: String!
    }

    """
    Root query type for the Service GraphQL API.
    Provides read-only access to service data with various filtering options.
    """
    type Query {
        """
        Get all services with optional filtering by category or name.
        
        Args:
            category: Filter by category name (case-insensitive)
            name: Filter by service name (case-insensitive, partial match)
        
        Returns: List of matching services
        """
        services(category: String, name: String): [Service!]!

        """
        Get a specific service by its ID.
        
        Args:
            id: The service ID to retrieve
        
        Returns: The requested service or null if not found
        """
        service(id: Int!): Service

        """
        Get all service categories with their sub-services.
        
        Returns: List of all available categories
        """
        categories: [Category!]!

        """
        Get a price estimate for a specific service.
        
        Args:
            serviceId: The ID of the service to estimate
        
        Returns: Price estimate details or error if service not found
        """
        priceEstimate(serviceId: Int!): PriceEstimate
    }

    """
    Root mutation type for the Service GraphQL API.
    Provides write operations for service management.
    """
    type Mutation {
        """
        Create a new service category with auto-generated ID.
        System automatically assigns the next available category ID.
        
        Args:
            input: Category creation details
        
        Returns: The newly created category
        """
        createCategory(input: CategoryInput!): Category

        """
        Create a new subcategory within an existing category with auto-generated ID.
        System automatically assigns the next available subcategory ID.
        
        Args:
            input: SubCategory creation details including parent category ID
        
        Returns: The newly created subcategory with category information
        """
        createSubCategory(input: SubCategoryInput!): SubService

        """
        Create a new service in a specified category and sub-service.
        
        Args:
            input: Service creation details
        
        Returns: The newly created service
        """
        createService(input: ServiceInput!): Service

        """
        Update an existing service's details.
        
        Args:
            id: The service ID to update
            input: Fields to update
        
        Returns: The updated service
        """
        updateService(id: Int!, input: UpdateServiceInput!): Service

        """
        Delete an existing service by ID.
        
        Args:
            id: The service ID to delete
        
        Returns: Success confirmation and message
        """
        deleteService(id: Int!): DeleteResponse!
    }
`;

// ============================================================================
// GRAPHQL RESOLVERS
// ============================================================================

const resolvers = {
    Query: {
        /**
         * Resolver for services query with optional filtering
         */
        services: async (_, { category, name }) => {
            let services = await loadServices();
            
            if (category) {
                services = services.filter(service => 
                    service.categoryName.toLowerCase() === category.toLowerCase()
                );
            }
            
            if (name) {
                services = services.filter(service => 
                    service.name.toLowerCase().includes(name.toLowerCase())
                );
            }
            
            return services;
        },

        /**
         * Resolver for single service by ID
         */
        service: async (_, { id }) => {
            const services = await loadServices();
            return services.find(s => s.id === id) || null;
        },

        /**
         * Resolver for all categories
         */
        categories: async () => {
            const servicesJson = await loadServicesJson();
            return servicesJson.services.map(category => ({
                id: category.id,
                name: category.category,
                subServices: category.subServices.map(sub => ({
                    id: sub.id,
                    name: sub.name
                }))
            }));
        },

        /**
         * Resolver for price estimate
         */
        priceEstimate: async (_, { serviceId }) => {
            const services = await loadServices();
            const service = services.find(s => s.id === serviceId);
            
            if (!service) {
                throw new Error(`Service with ID ${serviceId} not found`);
            }
            
            return {
                basePrice: service.pricePerHour,
                estimatedPrice: service.pricePerHour,
                currency: 'USD',
                serviceId: service.id,
                serviceName: service.name
            };
        }
    },

    Mutation: {
        /**
         * Resolver for creating a new category
         */
        createCategory: async (_, { input }) => {
            await initializeDB();
            
            const { name } = input;
            
            if (!name || !name.trim()) {
                throw new Error('Category name is required');
            }
            
            // Check if category with same name already exists
            const existingCategory = await Category.findOne({ 
                category: { $regex: new RegExp(`^${name}$`, 'i') } 
            });
            
            if (existingCategory) {
                throw new Error(`Category with name '${name}' already exists with ID ${existingCategory.id}`);
            }
            
            // Find max category ID and generate new one
            const categories = await Category.find({}).sort({ id: -1 }).limit(1);
            const maxId = categories.length > 0 ? categories[0].id : 0;
            const newCategoryId = maxId + 1;
            
            // Create new category
            const newCategory = new Category({
                id: newCategoryId,
                category: name.trim(),
                subServices: []
            });
            
            await newCategory.save();
            
            return {
                id: newCategory.id,
                name: newCategory.category,
                subServices: []
            };
        },

        /**
         * Resolver for creating a new subcategory
         */
        createSubCategory: async (_, { input }) => {
            await initializeDB();
            
            const { categoryId, name } = input;
            
            if (!name || !name.trim()) {
                throw new Error('SubCategory name is required');
            }
            
            // Find the category
            const category = await Category.findOne({ id: categoryId });
            if (!category) {
                throw new Error(`Category with ID ${categoryId} not found`);
            }
            
            // Check if subcategory with same name already exists in this category
            const existingSubService = category.subServices.find(
                sub => sub.name.toLowerCase() === name.trim().toLowerCase()
            );
            
            if (existingSubService) {
                throw new Error(`SubCategory with name '${name}' already exists in this category with ID ${existingSubService.id}`);
            }
            
            // Generate new subcategory ID
            // Pattern: categoryId * 100 + next sequential number
            const baseId = categoryId * 100;
            const maxSubId = category.subServices.length > 0
                ? Math.max(...category.subServices.map(s => s.id))
                : baseId;
            
            // If max is less than base, start from base + 1, otherwise increment
            const newSubServiceId = maxSubId < baseId ? baseId + 1 : maxSubId + 1;
            
            // Create new subcategory
            const newSubService = {
                id: newSubServiceId,
                name: name.trim(),
                services: []
            };
            
            category.subServices.push(newSubService);
            await category.save();
            
            return {
                id: newSubService.id,
                name: newSubService.name
            };
        },

        /**
         * Resolver for creating a new service
         */
        createService: async (_, { input }) => {
            await initializeDB();
            
            const { categoryId, subServiceId, name, pricePerHour } = input;
            
            // Find the category
            const category = await Category.findOne({ id: categoryId });
            if (!category) {
                throw new Error(`Category with ID ${categoryId} not found`);
            }
            
            // Find the subservice
            const subService = category.subServices.find(s => s.id === subServiceId);
            if (!subService) {
                throw new Error(`SubService with ID ${subServiceId} not found`);
            }
            
            // Create new service ID
            const newServiceId = Math.max(...subService.services.map(s => s.id), 0) + 1;
            
            // Create new service
            const newService = {
                id: newServiceId,
                name,
                pricePerHour
            };
            
            // Add to services array
            subService.services.push(newService);
            
            // Save to MongoDB
            await category.save();
            
            return {
                ...newService,
                categoryId: category.id,
                categoryName: category.category,
                subServiceId: subService.id,
                subServiceName: subService.name
            };
        },

        /**
         * Resolver for updating a service
         */
        updateService: async (_, { id, input }) => {
            await initializeDB();
            
            let updatedService = null;
            
            // Find and update the service
            const categories = await Category.find({});
            
            for (let category of categories) {
                for (let subService of category.subServices) {
                    const serviceIndex = subService.services.findIndex(s => s.id === id);
                    if (serviceIndex !== -1) {
                        if (input.name) {
                            subService.services[serviceIndex].name = input.name;
                        }
                        if (input.pricePerHour !== undefined) {
                            subService.services[serviceIndex].pricePerHour = input.pricePerHour;
                        }
                        
                        await category.save();
                        
                        updatedService = {
                            id: subService.services[serviceIndex].id,
                            name: subService.services[serviceIndex].name,
                            pricePerHour: subService.services[serviceIndex].pricePerHour,
                            categoryId: category.id,
                            categoryName: category.category,
                            subServiceId: subService.id,
                            subServiceName: subService.name
                        };
                        break;
                    }
                }
                if (updatedService) break;
            }
            
            if (!updatedService) {
                throw new Error(`Service with ID ${id} not found`);
            }
            
            return updatedService;
        },

        /**
         * Resolver for deleting a service
         */
        deleteService: async (_, { id }) => {
            await initializeDB();
            
            let serviceDeleted = false;
            
            // Find and delete the service
            const categories = await Category.find({});
            
            for (let category of categories) {
                for (let subService of category.subServices) {
                    const serviceIndex = subService.services.findIndex(s => s.id === id);
                    if (serviceIndex !== -1) {
                        subService.services.splice(serviceIndex, 1);
                        await category.save();
                        serviceDeleted = true;
                        break;
                    }
                }
                if (serviceDeleted) break;
            }
            
            if (!serviceDeleted) {
                throw new Error(`Service with ID ${id} not found`);
            }
            
            return {
                success: true,
                message: `Service with ID ${id} deleted successfully`
            };
        }
    }
};

// ============================================================================
// EXPRESS ROUTER FOR BACKWARD COMPATIBILITY
// ============================================================================

const router = express.Router();

/**
 * @swagger
 * /v1/services:
 *   get:
 *     summary: Get all services
 *     description: |
 *       **WHO CAN USE:**
 *       - Registered Tenants with verified accounts browsing service catalog
 *       - System Administrators with admin role credentials
 *       - Service Managers with service-read permissions
 *       - Internal Microservices (service-module, billing-module) for service lookups
 *       - API Partners with valid API keys for service discovery
 *       - Public API endpoints for unauthenticated catalog browsing (if configured)
 *       
 *       **WHO CANNOT USE:**
 *       - Blacklisted IP Addresses flagged for malicious activities
 *       - Rate Limit Exceeding Clients (over 1000 requests/hour)
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
router.get('/v1/services', async (req, res) => {
    try {
        const services = await loadServices();
        
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
 *     description: |
 *       **WHO CAN USE:**
 *       - Registered Tenants with verified accounts viewing service details
 *       - System Administrators with admin role credentials
 *       - Service Managers with service-read permissions
 *       - Internal Microservices (service-module, billing-module) for service lookups
 *       - API Partners with valid API keys
 *       - Public API endpoints for unauthenticated service detail viewing (if configured)
 *       
 *       **WHO CANNOT USE:**
 *       - Blacklisted IP Addresses flagged for malicious activities
 *       - Rate Limit Exceeding Clients (over 1000 requests/hour)
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
router.get('/v1/services/:serviceId', async (req, res) => {
    try {
        const services = await loadServices();
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
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Service Managers with service-create permissions
 *       - Authorized Service Providers adding their service offerings
 *       - Internal Microservices (service-module) for automated service catalog updates
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants without service-create permissions
 *       - Billing Managers lacking service management privileges
 *       - Suspended Tenants with 'suspended' or 'terminated' status
 *       - Insufficient Role Permissions (viewer role attempting service creation)
 *       - Requests with invalid or non-existent categoryId/subServiceId
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
router.post('/v1/services', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await initializeDB();
        
        const { categoryId, subServiceId, name, pricePerHour } = req.body;
        
        // Find the category and subService
        const category = await Category.findOne({ id: categoryId });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        
        const subService = category.subServices.find(s => s.id === subServiceId);
        if (!subService) {
            return res.status(400).json({ error: 'SubService not found' });
        }
        
        // Create new service
        const newService = {
            id: Math.max(...subService.services.map(s => s.id), 0) + 1,
            name,
            pricePerHour
        };
        
        // Add to services array
        subService.services.push(newService);
        
        // Save to MongoDB
        await category.save();
        
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
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Service Managers with service-update permissions
 *       - Authorized Service Providers updating their own service offerings
 *       - Internal Microservices (service-module) for automated service updates
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants without service-update permissions
 *       - Billing Managers lacking service management privileges
 *       - Suspended Tenants with 'suspended' or 'terminated' status
 *       - Insufficient Role Permissions (viewer role attempting modifications)
 *       - Service Providers attempting to update services owned by other providers
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
router.put('/v1/services/:serviceId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await initializeDB();
        
        let updatedService = null;
        const serviceId = parseInt(req.params.serviceId);
        
        // Find and update the service
        const categories = await Category.find({});
        
        for (let category of categories) {
            for (let subService of category.subServices) {
                const serviceIndex = subService.services.findIndex(s => s.id === serviceId);
                if (serviceIndex !== -1) {
                    // Update the service
                    subService.services[serviceIndex].name = req.body.name || subService.services[serviceIndex].name;
                    subService.services[serviceIndex].pricePerHour = req.body.pricePerHour || subService.services[serviceIndex].pricePerHour;
                    
                    await category.save();
                    
                    updatedService = {
                        id: subService.services[serviceIndex].id,
                        name: subService.services[serviceIndex].name,
                        pricePerHour: subService.services[serviceIndex].pricePerHour,
                        categoryId: category.id,
                        categoryName: category.category,
                        subServiceId: subService.id,
                        subServiceName: subService.name
                    };
                    break;
                }
            }
            if (updatedService) break;
        }
        
        if (!updatedService) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
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
 *     description: |
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials and delete permissions
 *       - Service Managers with service-delete permissions
 *       - Internal Microservices (service-module) executing service removal workflows
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Authenticated Tenants without service-delete permissions
 *       - Billing Managers lacking service management privileges
 *       - Service Managers without delete permissions
 *       - Authorized Service Providers attempting to delete services owned by others
 *       - Insufficient Role Permissions (non-admin, non-service-manager roles)
 *       - Requests attempting to delete services with active bills
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
router.delete('/v1/services/:serviceId', async (req, res) => {
    try {
        await initializeDB();
        
        const serviceId = parseInt(req.params.serviceId);
        let serviceDeleted = false;
        
        // Find and delete the service
        const categories = await Category.find({});
        
        for (let category of categories) {
            for (let subService of category.subServices) {
                const serviceIndex = subService.services.findIndex(s => s.id === serviceId);
                if (serviceIndex !== -1) {
                    subService.services.splice(serviceIndex, 1);
                    await category.save();
                    serviceDeleted = true;
                    break;
                }
            }
            if (serviceDeleted) break;
        }
        
        if (!serviceDeleted) {
            return res.status(404).json({ error: 'Service not found' });
        }
        
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
 *     description: |
 *       **WHO CAN USE:**
 *       - Registered Tenants with verified accounts requesting price estimates
 *       - System Administrators with admin role credentials
 *       - Billing Managers with pricing-read permissions
 *       - Internal Microservices (service-module, billing-module) for price calculations
 *       - API Partners with valid API keys for pricing information
 *       - Public API endpoints for unauthenticated price estimates (if configured)
 *       
 *       **WHO CANNOT USE:**
 *       - Blacklisted IP Addresses flagged for malicious activities
 *       - Rate Limit Exceeding Clients (over 1000 requests/hour)
 *       - Requests for non-existent serviceId
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
router.get('/v1/services/:serviceId/price-estimate', async (req, res) => {
    try {
        const services = await loadServices();
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
 *     description: |
 *       **WHO CAN USE:**
 *       - Registered Tenants with verified accounts browsing service categories
 *       - System Administrators with admin role credentials
 *       - Service Managers with service-read permissions
 *       - Internal Microservices (service-module, billing-module) for category lookups
 *       - API Partners with valid API keys
 *       - Public API endpoints for unauthenticated category browsing (if configured)
 *       
 *       **WHO CANNOT USE:**
 *       - Blacklisted IP Addresses flagged for malicious activities
 *       - Rate Limit Exceeding Clients (over 1000 requests/hour)
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
router.get('/v1/categories', async (req, res) => {
    try {
        const servicesJson = await loadServicesJson();
        
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

/**
 * @swagger
 * /v1/categories:
 *   post:
 *     summary: Create a new service category
 *     description: |
 *       Creates a new service category with auto-generated ID.
 *       The system automatically assigns the next available category ID.
 *       
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Service Managers with category-create permissions
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Non-admin users
 *     tags: [Services]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Food Services"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Auto-generated category ID
 *                 name:
 *                   type: string
 *                   description: Category name
 *                 subServices:
 *                   type: array
 *                   description: Empty array of sub-services
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/v1/categories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await initializeDB();
        
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        
        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ 
            category: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingCategory) {
            return res.status(400).json({ 
                error: 'Category with this name already exists',
                existingId: existingCategory.id
            });
        }
        
        // Find max category ID and generate new one
        const categories = await Category.find({}).sort({ id: -1 }).limit(1);
        const maxId = categories.length > 0 ? categories[0].id : 0;
        const newCategoryId = maxId + 1;
        
        // Create new category
        const newCategory = new Category({
            id: newCategoryId,
            category: name.trim(),
            subServices: []
        });
        
        await newCategory.save();
        
        res.status(201).json({
            id: newCategory.id,
            name: newCategory.category,
            subServices: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /v1/categories/{categoryId}/subcategories:
 *   post:
 *     summary: Create a new sub-service category
 *     description: |
 *       Creates a new sub-service within an existing category with auto-generated ID.
 *       The system automatically assigns the next available subcategory ID based on the category ID.
 *       
 *       **WHO CAN USE:**
 *       - System Administrators with admin role credentials
 *       - Service Managers with subcategory-create permissions
 *       
 *       **WHO CANNOT USE:**
 *       - Anonymous Requests without valid JWT tokens
 *       - Non-admin users
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID to add the subcategory to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: SubCategory name
 *                 example: "Personal Chef Services"
 *     responses:
 *       201:
 *         description: SubCategory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Auto-generated subcategory ID
 *                 name:
 *                   type: string
 *                   description: SubCategory name
 *                 categoryId:
 *                   type: integer
 *                   description: Parent category ID
 *                 categoryName:
 *                   type: string
 *                   description: Parent category name
 *                 services:
 *                   type: array
 *                   description: Empty array of services
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
router.post('/v1/categories/:categoryId/subcategories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await initializeDB();
        
        const categoryId = parseInt(req.params.categoryId);
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'SubCategory name is required' });
        }
        
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }
        
        // Find the category
        const category = await Category.findOne({ id: categoryId });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        // Check if subcategory with same name already exists in this category
        const existingSubService = category.subServices.find(
            sub => sub.name.toLowerCase() === name.trim().toLowerCase()
        );
        
        if (existingSubService) {
            return res.status(400).json({ 
                error: 'SubCategory with this name already exists in this category',
                existingId: existingSubService.id
            });
        }
        
        // Generate new subcategory ID
        // Pattern: categoryId * 100 + next sequential number
        const baseId = categoryId * 100;
        const maxSubId = category.subServices.length > 0
            ? Math.max(...category.subServices.map(s => s.id))
            : baseId;
        
        // If max is less than base, start from base + 1, otherwise increment
        const newSubServiceId = maxSubId < baseId ? baseId + 1 : maxSubId + 1;
        
        // Create new subcategory
        const newSubService = {
            id: newSubServiceId,
            name: name.trim(),
            services: []
        };
        
        category.subServices.push(newSubService);
        await category.save();
        
        res.status(201).json({
            id: newSubService.id,
            name: newSubService.name,
            categoryId: category.id,
            categoryName: category.category,
            services: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    getAllServices: loadServices,
    router,
    typeDefs,
    resolvers,
    initializeDB
};
