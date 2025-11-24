const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { connectDB } = require('../config/database');
const { Category } = require('../models/Service');
const { access: accessLogger, error: errorLogger, debug: debugLogger } = require('../utils/logger');

const router = express.Router();

// Service Provider data file path
const SERVICE_PROVIDER_FILE = path.join(__dirname, '..', 'service-provider.json');

// OpenRouteService API configuration - Using public free API
const ORS_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

// Initialize database connection
let dbInitialized = false;
const initializeDB = async () => {
    if (!dbInitialized) {
        await connectDB();
        dbInitialized = true;
    }
};

/**
 * Calculate distance and travel time between two coordinates using OSRM API (Open Source Routing Machine)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {Object} Object containing distance in kilometers and duration in minutes
 */
async function calculateDistanceWithAPI(lat1, lon1, lat2, lon2) {
    try {
        const url = `${ORS_BASE_URL}/${lon1},${lat1};${lon2},${lat2}?overview=false&steps=false`;
        
        const response = await axios.get(url, {
            timeout: 5000 // 5 second timeout
        });

        const route = response.data.routes[0];
        const distanceKm = route.distance / 1000; // Convert meters to kilometers
        const durationMinutes = route.duration / 60; // Convert seconds to minutes

        return {
            distance: parseFloat(distanceKm.toFixed(2)),
            duration: parseFloat(durationMinutes.toFixed(1)),
            source: 'osrm'
        };
    } catch (error) {
        debugLogger.debug('OSRM API error, falling back to Haversine formula:', error.message);
        
        // Fallback to Haversine formula if API fails
        const distance = calculateDistanceHaversine(lat1, lon1, lat2, lon2);
        return {
            distance: parseFloat(distance.toFixed(2)),
            duration: null, // No duration estimate with Haversine
            source: 'haversine'
        };
    }
}

/**
 * Calculate distance between two coordinates using Haversine formula (fallback)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistanceHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

/**
 * Check if a service exists in MongoDB
 * @param {number} serviceId - Service ID to check
 * @returns {boolean} True if service exists, false otherwise
 */
async function serviceExists(serviceId) {
    try {
        await initializeDB();
        
        const categories = await Category.find({});
        
        for (const category of categories) {
            for (const subService of category.subServices) {
                for (const service of subService.services) {
                    if (service.id === serviceId) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    } catch (error) {
        errorLogger.error('Error checking service existence:', error);
        return false;
    }
}

/**
 * Load service providers from JSON file
 * @returns {Array} Array of service providers
 */
async function loadServiceProviders() {
    try {
        const data = await fs.readFile(SERVICE_PROVIDER_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        errorLogger.error('Error loading service providers:', error);
        return [];
    }
}

/**
 * Save service providers to JSON file
 * @param {Array} providers - Array of service providers
 */
async function saveServiceProviders(providers) {
    try {
        await fs.writeFile(SERVICE_PROVIDER_FILE, JSON.stringify(providers, null, 4));
    } catch (error) {
        errorLogger.error('Error saving service providers:', error);
        throw error;
    }
}

/**
 * Check if time ranges overlap
 * @param {Object} provider - Service provider object
 * @param {string} searchStartDate - Search start date (YYYY-MM-DD)
 * @param {number} searchStartHour - Search start hour
 * @param {number} searchStartMinute - Search start minute
 * @param {string} searchEndDate - Search end date (YYYY-MM-DD)
 * @param {number} searchEndHour - Search end hour
 * @param {number} searchEndMinute - Search end minute
 * @returns {boolean} True if time ranges overlap
 */
function isTimeOverlap(provider, searchStartDate, searchStartHour, searchStartMinute, searchEndDate, searchEndHour, searchEndMinute) {
    // Convert dates and times to Date objects for comparison
    const providerStart = new Date(`${provider.start_available_time_date}T${provider.start_available_time_hour.toString().padStart(2, '0')}:${provider.start_available_time_minute.toString().padStart(2, '0')}:00`);
    const providerEnd = new Date(`${provider.end_available_time_date}T${provider.end_available_time_hour.toString().padStart(2, '0')}:${provider.end_available_time_minute.toString().padStart(2, '0')}:00`);
    
    const searchStart = new Date(`${searchStartDate}T${searchStartHour.toString().padStart(2, '0')}:${searchStartMinute.toString().padStart(2, '0')}:00`);
    const searchEnd = new Date(`${searchEndDate}T${searchEndHour.toString().padStart(2, '0')}:${searchEndMinute.toString().padStart(2, '0')}:00`);
    
    // Check if there's any overlap
    return providerStart <= searchEnd && providerEnd >= searchStart;
}

/**
 * @swagger
 * /api/v1/find-providers:
 *   get:
 *     summary: Find service providers within a specific location and time range
 *     tags: [Find Service Providers]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the service to find providers for
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *       - in: query
 *         name: start_hour
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 23
 *         description: Start hour (0-23)
 *       - in: query
 *         name: start_minute
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 59
 *         description: Start minute (0-59)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *       - in: query
 *         name: end_hour
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 23
 *         description: End hour (0-23)
 *       - in: query
 *         name: end_minute
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 59
 *         description: End minute (0-59)
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude of the search location
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude of the search location
 *       - in: query
 *         name: radius_distance
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Search radius distance in kilometers
 *     responses:
 *       200:
 *         description: List of service providers found within the specified criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       serviceId:
 *                         type: integer
 *                       start_available_time_date:
 *                         type: string
 *                         format: date
 *                       start_available_time_hour:
 *                         type: integer
 *                       start_available_time_minute:
 *                         type: integer
 *                       end_available_time_date:
 *                         type: string
 *                         format: date
 *                       end_available_time_hour:
 *                         type: integer
 *                       end_available_time_minute:
 *                         type: integer
 *                       latitude:
 *                         type: number
 *                         format: float
 *                       longitude:
 *                         type: number
 *                         format: float
 *                       distance:
 *                         type: number
 *                         format: float
 *                         description: Distance from search location in kilometers (via road/driving)
 *                       estimatedTravelTime:
 *                         type: number
 *                         format: float
 *                         description: Estimated travel time in minutes (driving)
 *                       distanceSource:
 *                         type: string
 *                         description: Source of distance calculation (osrm or haversine)
 *                 total:
 *                   type: integer
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       404:
 *         description: Service ID not found
 *       500:
 *         description: Internal server error
 */
router.get('/v1/find-providers', async (req, res) => {
    try {
        const {
            serviceId,
            start_date,
            start_hour,
            start_minute,
            end_date,
            end_hour,
            end_minute,
            latitude,
            longitude,
            radius_distance
        } = req.query;

        // Validate required parameters
        if (!serviceId || !start_date || start_hour === undefined || start_minute === undefined ||
            !end_date || end_hour === undefined || end_minute === undefined ||
            latitude === undefined || longitude === undefined || radius_distance === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters. Please provide: serviceId, start_date, start_hour, start_minute, end_date, end_hour, end_minute, latitude, longitude, radius_distance'
            });
        }

        // Convert and validate parameter types
        const parsedServiceId = parseInt(serviceId);
        const parsedStartHour = parseInt(start_hour);
        const parsedStartMinute = parseInt(start_minute);
        const parsedEndHour = parseInt(end_hour);
        const parsedEndMinute = parseInt(end_minute);
        const parsedLatitude = parseFloat(latitude);
        const parsedLongitude = parseFloat(longitude);
        const parsedRadiusDistance = parseFloat(radius_distance);

        // Validate parameter ranges
        if (isNaN(parsedServiceId) || isNaN(parsedStartHour) || isNaN(parsedStartMinute) ||
            isNaN(parsedEndHour) || isNaN(parsedEndMinute) || isNaN(parsedLatitude) ||
            isNaN(parsedLongitude) || isNaN(parsedRadiusDistance)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameter types. Please ensure all numeric parameters are valid numbers'
            });
        }

        if (parsedStartHour < 0 || parsedStartHour > 23 || parsedEndHour < 0 || parsedEndHour > 23) {
            return res.status(400).json({
                success: false,
                error: 'Hours must be between 0 and 23'
            });
        }

        if (parsedStartMinute < 0 || parsedStartMinute > 59 || parsedEndMinute < 0 || parsedEndMinute > 59) {
            return res.status(400).json({
                success: false,
                error: 'Minutes must be between 0 and 59'
            });
        }

        if (parsedRadiusDistance <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Radius distance must be greater than 0'
            });
        }

        // Check if service exists in MongoDB
        const serviceExistsInDB = await serviceExists(parsedServiceId);
        if (!serviceExistsInDB) {
            return res.status(404).json({
                success: false,
                error: `Service with ID ${parsedServiceId} not found in the database`
            });
        }

        // Load service providers
        const allProviders = await loadServiceProviders();

        // Filter providers based on criteria (excluding distance check first)
        const potentialProviders = allProviders.filter(provider => {
            // Check if service ID matches
            if (provider.serviceId !== parsedServiceId) {
                return false;
            }

            // Check if time ranges overlap
            if (!isTimeOverlap(provider, start_date, parsedStartHour, parsedStartMinute, end_date, parsedEndHour, parsedEndMinute)) {
                return false;
            }

            return true;
        });

        // Calculate distances for potential providers using Map API
        const matchingProviders = [];
        
        for (const provider of potentialProviders) {
            try {
                const distanceInfo = await calculateDistanceWithAPI(
                    parsedLatitude, parsedLongitude,
                    provider.latitude, provider.longitude
                );

                // Check if within radius
                if (distanceInfo.distance <= parsedRadiusDistance) {
                    provider.distance = distanceInfo.distance;
                    provider.estimatedTravelTime = distanceInfo.duration;
                    provider.distanceSource = distanceInfo.source;
                    matchingProviders.push(provider);
                }
            } catch (error) {
                errorLogger.error('Error calculating distance for provider:', provider.id, error);
                // Skip this provider if distance calculation fails
                continue;
            }
        }

        // Sort by distance (closest first)
        matchingProviders.sort((a, b) => a.distance - b.distance);

        accessLogger.info(`Found ${matchingProviders.length} service providers for service ${parsedServiceId} within ${parsedRadiusDistance}km`);

        res.json({
            success: true,
            data: matchingProviders,
            total: matchingProviders.length,
            searchCriteria: {
                serviceId: parsedServiceId,
                timeRange: {
                    start: `${start_date} ${parsedStartHour.toString().padStart(2, '0')}:${parsedStartMinute.toString().padStart(2, '0')}`,
                    end: `${end_date} ${parsedEndHour.toString().padStart(2, '0')}:${parsedEndMinute.toString().padStart(2, '0')}`
                },
                location: {
                    latitude: parsedLatitude,
                    longitude: parsedLongitude
                },
                radius: parsedRadiusDistance
            }
        });

    } catch (error) {
        errorLogger.error('Error finding service providers:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/v1/service-providers:
 *   get:
 *     summary: Get all service providers
 *     tags: [Find Service Providers]
 *     responses:
 *       200:
 *         description: List of all service providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       serviceId:
 *                         type: integer
 *                       start_available_time_date:
 *                         type: string
 *                         format: date
 *                       start_available_time_hour:
 *                         type: integer
 *                       start_available_time_minute:
 *                         type: integer
 *                       end_available_time_date:
 *                         type: string
 *                         format: date
 *                       end_available_time_hour:
 *                         type: integer
 *                       end_available_time_minute:
 *                         type: integer
 *                       latitude:
 *                         type: number
 *                         format: float
 *                       longitude:
 *                         type: number
 *                         format: float
 *                 total:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/v1/service-providers', async (req, res) => {
    try {
        const providers = await loadServiceProviders();
        
        res.json({
            success: true,
            data: providers,
            total: providers.length
        });

    } catch (error) {
        errorLogger.error('Error getting service providers:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/v1/service-providers:
 *   post:
 *     summary: Add a new service provider
 *     tags: [Find Service Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - start_available_time_date
 *               - start_available_time_hour
 *               - start_available_time_minute
 *               - end_available_time_date
 *               - end_available_time_hour
 *               - end_available_time_minute
 *               - latitude
 *               - longitude
 *             properties:
 *               serviceId:
 *                 type: integer
 *               start_available_time_date:
 *                 type: string
 *                 format: date
 *               start_available_time_hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 23
 *               start_available_time_minute:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *               end_available_time_date:
 *                 type: string
 *                 format: date
 *               end_available_time_hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 23
 *               end_available_time_minute:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Service provider created successfully
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       404:
 *         description: Service ID not found
 *       500:
 *         description: Internal server error
 */
router.post('/v1/service-providers', async (req, res) => {
    try {
        const {
            serviceId,
            start_available_time_date,
            start_available_time_hour,
            start_available_time_minute,
            end_available_time_date,
            end_available_time_hour,
            end_available_time_minute,
            latitude,
            longitude
        } = req.body;

        // Validate required fields
        if (!serviceId || !start_available_time_date || start_available_time_hour === undefined ||
            start_available_time_minute === undefined || !end_available_time_date ||
            end_available_time_hour === undefined || end_available_time_minute === undefined ||
            latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if service exists in MongoDB
        const serviceExistsInDB = await serviceExists(serviceId);
        if (!serviceExistsInDB) {
            return res.status(404).json({
                success: false,
                error: `Service with ID ${serviceId} not found in the database`
            });
        }

        // Load existing providers
        const providers = await loadServiceProviders();

        // Generate new ID
        const newId = providers.length > 0 ? Math.max(...providers.map(p => p.id)) + 1 : 1;

        // Create new provider
        const newProvider = {
            id: newId,
            serviceId: parseInt(serviceId),
            start_available_time_date,
            start_available_time_hour: parseInt(start_available_time_hour),
            start_available_time_minute: parseInt(start_available_time_minute),
            end_available_time_date,
            end_available_time_hour: parseInt(end_available_time_hour),
            end_available_time_minute: parseInt(end_available_time_minute),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        providers.push(newProvider);
        await saveServiceProviders(providers);

        accessLogger.info(`New service provider created with ID ${newId}`);

        res.status(201).json({
            success: true,
            data: newProvider,
            message: 'Service provider created successfully'
        });

    } catch (error) {
        errorLogger.error('Error creating service provider:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = { router, initializeDB };
