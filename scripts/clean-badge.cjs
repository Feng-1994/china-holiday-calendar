const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const htmlFiles = ['index.html', 'widget.html'];

htmlFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf-8');

  const cleaned = html.replace(
    /\s*<script>\s*\(function\(\)\s*\{\s*'use strict';\s*if\s*\(window\.TraeBadgePlugin\)[\s\S]*?}\)\(\);\s*<\/script>/g,
    ''
  );

  if (cleaned !== html) {
    fs.writeFileSync(filePath, cleaned, 'utf-8');
    console.log(`Cleaned Trae badge from ${file}`);
  } else {
    console.log(`No Trae badge found in ${file}`);
  }
});
