// Run this in Node.js to create PNG icons, OR open generate-icons.html in your browser

const fs = require('fs');
const { createCanvas } = require('canvas'); // npm install canvas

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const r = size * 0.15;
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.fill();

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2383e2');
    gradient.addColorStop(1, '#6366f1');

    const cx = size / 2;
    const bulbRadius = size * 0.28;
    const topY = size * 0.18;

    // Lightbulb
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, topY + bulbRadius, bulbRadius, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    const neckTop = topY + bulbRadius * 1.5;
    const neckWidth = size * 0.15;
    ctx.fillRect(cx - neckWidth, neckTop, neckWidth * 2, size * 0.15);

    // Base
    ctx.globalAlpha = 0.7;
    ctx.fillRect(cx - neckWidth * 0.9, neckTop + size * 0.16, neckWidth * 1.8, size * 0.04);

    // Glow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, topY + bulbRadius * 0.7, bulbRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
}

// Generate and save icons
[16, 48, 128].forEach(size => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});

console.log('Done! Icons created.');
