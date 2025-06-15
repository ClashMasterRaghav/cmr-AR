const fs = require('fs');
const path = require('path');

// Read the bundled content
const bundleContent = fs.readFileSync('examples/dist/ar_bundle.js', 'utf8');

// Write the bundle to the dist directory
fs.writeFileSync('examples/dist/ar_bundle.js', bundleContent);

console.log('Bundle created successfully!'); 