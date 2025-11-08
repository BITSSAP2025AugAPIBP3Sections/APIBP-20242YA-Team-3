#!/usr/bin/env node

/**
 * OpenAPI Spec Export Utility
 * 
 * This script exports your JSDoc-generated OpenAPI specification 
 * to both JSON and YAML formats for external sharing.
 * 
 * Usage: node scripts/export-api-spec.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Import your existing swagger configuration
const swaggerSpecs = require('../swagger/swagger.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'api-docs');
const JSON_OUTPUT = path.join(OUTPUT_DIR, 'openapi.json');
const YAML_OUTPUT = path.join(OUTPUT_DIR, 'openapi.yaml');

/**
 * Export OpenAPI spec to JSON format
 */
function exportToJSON() {
    try {
        const jsonContent = JSON.stringify(swaggerSpecs, null, 2);
        fs.writeFileSync(JSON_OUTPUT, jsonContent, 'utf8');
        console.log(' OpenAPI spec exported to JSON:', JSON_OUTPUT);
        return true;
    } catch (error) {
        console.error(' Error exporting to JSON:', error.message);
        return false;
    }
}

/**
 * Export OpenAPI spec to YAML format
 */
function exportToYAML() {
    try {
        const yamlContent = yaml.dump(swaggerSpecs, {
            indent: 2,
            lineWidth: 120,
            noRefs: true
        });
        fs.writeFileSync(YAML_OUTPUT, yamlContent, 'utf8');
        console.log('OpenAPI spec exported to YAML:', YAML_OUTPUT);
        return true;
    } catch (error) {
        console.error('Error exporting to YAML:', error.message);
        return false;
    }
}

/**
 * Add metadata about the export
 */
function addExportMetadata() {
    const metadata = {
        generatedAt: new Date().toISOString(),
        generatedBy: 'export-api-spec.js',
        source: 'JSDoc comments in code',
        approach: 'Code-first with hybrid export',
        note: 'This file is auto-generated. Do not edit directly. Update JSDoc comments in your route files instead.'
    };
    
    const metadataPath = path.join(OUTPUT_DIR, 'export-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    console.log('📋 Export metadata created:', metadataPath);
}

/**
 * Create a README for the api-docs directory
 */
function createAPIDocsReadme() {
    const readmeContent = `# API Documentation

This directory contains exported OpenAPI specifications for the Service Management API.

## Files

- \`openapi.json\` - OpenAPI specification in JSON format
- \`openapi.yaml\` - OpenAPI specification in YAML format  
- \`export-metadata.json\` - Information about when and how these files were generated

## Usage

### For External Teams
Share these files with external teams who need API specifications without access to the source code.

### For API Testing Tools
Import \`openapi.json\` or \`openapi.yaml\` into tools like:
- Postman
- Insomnia
- Swagger Editor
- API testing frameworks

### For Documentation Sites
Use these files to generate static documentation with tools like:
- Redoc
- Swagger UI (standalone)
- API documentation generators

## Important Notes

⚠️ **Do not edit these files directly!** 

These files are auto-generated from JSDoc comments in the source code. To update the API documentation:

1. Edit the JSDoc comments in your route files (\`*-module/*.js\`)
2. Run \`npm run export-api-spec\` to regenerate these files

## Generation

Files are generated using: \`npm run export-api-spec\`

Source: JSDoc comments → swagger.js → exported files

This follows a **code-first hybrid approach** where documentation lives in code but can be exported for external use.
`;

    const readmePath = path.join(OUTPUT_DIR, 'README.md');
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log('📚 API docs README created:', readmePath);
}

/**
 * Main export function
 */
function exportAPISpec() {
    console.log('🚀 Starting OpenAPI specification export...\n');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log('📁 Created output directory:', OUTPUT_DIR);
    }
    
    // Export to both formats
    const jsonSuccess = exportToJSON();
    const yamlSuccess = exportToYAML();
    
    if (jsonSuccess && yamlSuccess) {
        addExportMetadata();
        createAPIDocsReadme();
        
        console.log('\n🎉 Export completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   JSON: ${JSON_OUTPUT}`);
        console.log(`   YAML: ${YAML_OUTPUT}`);
        console.log(`   Docs: ${path.join(OUTPUT_DIR, 'README.md')}`);
        console.log('\n💡 You can now share these files with external teams!');
    } else {
        console.log('\n Export failed. Please check the errors above.');
        process.exit(1);
    }
}

// Run the export if this script is executed directly
if (require.main === module) {
    exportAPISpec();
}

module.exports = { exportAPISpec };