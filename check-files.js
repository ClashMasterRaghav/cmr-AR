const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'examples/dist/ar_bundle.js',
    'examples/ar_web.html',
    'examples/main.css',
    'build/three.module.js',
    'examples/jsm/webxr/ARButton.js',
    'examples/jsm/webxr/XRControllerModelFactory.js'
];

console.log('Checking required files for GitHub Pages deployment...\n');

let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - EXISTS`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log('\n' + (allFilesExist ? '✅ All files are present!' : '❌ Some files are missing!'));

if (!allFilesExist) {
    console.log('\nPlease run: npm run build:gh');
    process.exit(1);
} else {
    console.log('\nReady for GitHub Pages deployment!');
} 