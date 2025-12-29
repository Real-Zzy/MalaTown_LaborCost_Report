#!/usr/bin/env node
/**
 * Generate manifest.json for reports portal
 * Scans the report/ directory for HTML files in subdirectories and creates a manifest
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'report');
const MANIFEST_FILE = path.join(__dirname, '..', 'manifest.json');

// Scan for HTML files in report/ subdirectories
function scanReports() {
    const files = [];
    
    if (!fs.existsSync(REPORTS_DIR)) {
        console.log('Report directory does not exist.');
        return files;
    }
    
    // Read all items in report directory
    const items = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
    
    for (const item of items) {
        // Only process subdirectories
        if (item.isDirectory()) {
            const subDirPath = path.join(REPORTS_DIR, item.name);
            const subItems = fs.readdirSync(subDirPath, { withFileTypes: true });
            
            // Look for HTML files in this subdirectory
            for (const subItem of subItems) {
                if (subItem.isFile() && subItem.name.endsWith('.html')) {
                    const filePath = path.join(subDirPath, subItem.name);
                    const stats = fs.statSync(filePath);
                    
                    // Generate path relative to root (report/store_name/file.html)
                    const relativePath = `report/${item.name}/${subItem.name}`;
                    
                    files.push({
                        name: subItem.name,
                        path: relativePath,
                        store: item.name, // Store the store name for reference
                        size: stats.size,
                        modified: stats.mtime.toISOString()
                    });
                }
            }
        }
    }
    
    // Sort by filename
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    return files;
}

// Generate manifest
function generateManifest() {
    console.log('Scanning report/ directory...');
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
        console.log(`    - ${file.path}`);
    });
}

// Run
try {
    generateManifest();
} catch (error) {
    console.error('Error generating manifest:', error);
    process.exit(1);
}

