#!/usr/bin/env node
/**
 * Generate manifest.json for reports portal
 * Scans the reports/ directory for HTML files and creates a manifest
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const MANIFEST_FILE = path.join(__dirname, '..', 'manifest.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
    console.log('Creating reports directory...');
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Scan for HTML files
function scanReports() {
    const files = [];
    
    if (!fs.existsSync(REPORTS_DIR)) {
        console.log('Reports directory does not exist. Creating...');
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
        return files;
    }
    
    const items = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isFile() && item.name.endsWith('.html')) {
            const filePath = path.join(REPORTS_DIR, item.name);
            const stats = fs.statSync(filePath);
            
            files.push({
                name: item.name,
                path: `reports/${item.name}`,
                size: stats.size,
                modified: stats.mtime.toISOString()
            });
        }
    }
    
    // Sort by filename
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    return files;
}

// Generate manifest
function generateManifest() {
    console.log('Scanning reports directory...');
    const files = scanReports();
    
    const manifest = {
        generated: new Date().toISOString(),
        count: files.length,
        reports: files
    };
    
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
    
    console.log(`✓ Generated manifest.json with ${files.length} report(s)`);
    console.log(`  Reports found:`);
    files.forEach(file => {
        console.log(`    - ${file.name}`);
    });
}

// Run
try {
    generateManifest();
} catch (error) {
    console.error('Error generating manifest:', error);
    process.exit(1);
}

