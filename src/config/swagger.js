const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Service Management API',
            version: '1.0.0',
            description: `API documentation for the Service Management System

## API Access Criteria

### Who Can Use This API (Inclusion):
- **Registered Tenants**: Authenticated tenants with valid accounts
- **System Administrators**: Admin personnel with appropriate credentials
- **Billing Managers**: Staff with billing management permissions
- **Service Managers**: Staff managing service catalog operations
- **Internal Microservices**: Backend services (auth, billing, notification, payments, service modules)
- **API Partners**: Third-party integrators with valid API keys

### Who Cannot Use This API (Exclusion):
- **Unauthenticated Requests**: API calls without valid authentication tokens
- **Suspended Accounts**: Tenants with suspended or terminated status
- **Insufficient Permissions**: Entities attempting operations beyond their role scope
- **Expired Credentials**: Requests with expired authentication tokens or API keys`,
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Service ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Service name'
                        },
                        pricePerHour: {
                            type: 'number',
                            description: 'Price per hour for the service'
                        },
                        categoryId: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        categoryName: {
                            type: 'string',
                            description: 'Category name'
                        },
                        subServiceId: {
                            type: 'integer',
                            description: 'Sub-service ID'
                        },
                        subServiceName: {
                            type: 'string',
                            description: 'Sub-service name'
                        }
                    }
                },
                Bill: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Bill ID'
                        },
                        serviceId: {
                            type: 'integer',
                            description: 'Service ID'
                        },
                        tenantId: {
                            type: 'integer',
                            description: 'Tenant ID'
                        },
                        billAmount: {
                            type: 'number',
                            description: 'Total bill amount'
                        },
                        hours: {
                            type: 'number',
                            description: 'Number of hours'
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Bill date'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'paid', 'active', 'completed', 'cancelled'],
                            description: 'Bill status'
                        },
                        transactionId: {
                            type: 'string',
                            description: 'Transaction/Order ID'
                        },
                        paymentMethod: {
                            type: 'string',
                            description: 'Payment method used'
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional metadata including notes, service details, etc.'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Tenant: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Tenant ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Tenant name'
                        },
                        companyName: {
                            type: 'string',
                            description: 'Company name'
                        },
                        address: {
                            type: 'string',
                            description: 'Tenant address/billing address'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Tenant email'
                        },
                        phone: {
                            type: 'string',
                            description: 'Tenant phone number'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'trial', 'premium', 'suspended', 'terminated'],
                            description: 'Tenant account status'
                        }
                    }
                },
                TenantWithPassword: {
                    allOf: [
                        { $ref: '#/components/schemas/Tenant' },
                        {
                            type: 'object',
                            required: ['password'],
                            properties: {
                                password: {
                                    type: 'string',
                                    description: 'Tenant password'
                                }
                            }
                        }
                    ]
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Tenant email'
                        },
                        password: {
                            type: 'string',
                            description: 'Tenant password'
                        }
                    }
                },
                PaymentRequest: {
                    type: 'object',
                    required: ['billId', 'status'],
                    properties: {
                        billId: {
                            type: 'integer',
                            description: 'Bill ID'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'paid', 'cancelled'],
                            description: 'Payment status'
                        }
                    }
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Notification ID'
                        },
                        type: {
                            type: 'string',
                            enum: ['BILL_CREATED', 'PAYMENT_STATUS_UPDATED'],
                            description: 'Notification type'
                        },
                        message: {
                            type: 'string',
                            description: 'Notification message'
                        },
                        data: {
                            type: 'object',
                            description: 'Notification data payload'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                }
            }
        }
    },
    apis: [
        './src/controllers/service.controller.js',
        './src/controllers/billing.controller.js',
        './src/controllers/payment.controller.js',
        './src/controllers/auth.controller.js',
        './src/controllers/notification.controller.js'
    ]
};

const specs = swaggerJsdoc(options);
module.exports = specs;
