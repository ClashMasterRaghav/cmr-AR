const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for GitHub Pages deployment...\n');

// Check if bundle exists
const bundlePath = 'examples/dist/ar_bundle.js';
if (!fs.existsSync(bundlePath)) {
    console.log('❌ Bundle not found. Building...');
    console.log('Run: npm run build:gh');
    process.exit(1);
}

console.log('✅ Bundle found:', bundlePath);
console.log('📦 Bundle size:', (fs.statSync(bundlePath).size / 1024 / 1024).toFixed(2), 'MB');

// Check required files
const requiredFiles = [
    'examples/ar_web.html',
    'examples/main.css',
    'build/three.module.js',
    'examples/jsm/webxr/ARButton.js',
    'examples/jsm/webxr/XRControllerModelFactory.js'
];

console.log('\n📋 Checking required files:');
let allGood = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allGood = false;
    }
});

if (!allGood) {
    console.log('\n❌ Some files are missing. Please ensure all files are present.');
    process.exit(1);
}

console.log('\n🎉 All files are ready!');
console.log('\n📝 Next steps:');
console.log('1. git add .');
console.log('2. git commit -m "Deploy AR app to GitHub Pages"');
console.log('3. git push');
console.log('4. Wait for GitHub Pages to update (1-2 minutes)');
console.log('5. Visit: https://clashmasterraghav.github.io/cmr-AR/examples/ar_web.html');
console.log('\n🔧 For local development:');
console.log('npm run dev'); 