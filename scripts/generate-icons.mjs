/**
 * Generate NeuralQ app icons from SVG
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

// NeuralQ icon SVG — dark background, cyan "NQ" text with glow
function createIconSvg(size) {
  const fontSize = Math.round(size * 0.36);
  const subFontSize = Math.round(size * 0.09);
  const centerY = Math.round(size * 0.48);
  const subY = Math.round(size * 0.66);
  const glowRadius = Math.round(size * 0.03);
  const bgRadius = Math.round(size * 0.22);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0f0f1a"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#00f5ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="neon">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glowRadius}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${bgRadius}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${bgRadius}" fill="url(#glow)"/>
  <text x="50%" y="${centerY}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fontSize}"
    fill="#00f5ff" filter="url(#neon)">NQ</text>
  <text x="50%" y="${subY}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial, sans-serif" font-weight="600" font-size="${subFontSize}"
    fill="#00f5ff" opacity="0.6" letter-spacing="${Math.round(size * 0.01)}">NEURALQ</text>
</svg>`;
}

// Splash icon — just the NQ mark, no subtitle, smaller padding
function createSplashSvg(size) {
  const fontSize = Math.round(size * 0.5);
  const centerY = Math.round(size * 0.52);
  const glowRadius = Math.round(size * 0.04);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <filter id="neon">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glowRadius}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="#0a0a0f"/>
  <text x="50%" y="${centerY}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fontSize}"
    fill="#00f5ff" filter="url(#neon)">NQ</text>
</svg>`;
}

// Write SVGs
writeFileSync('assets/icon.svg', createIconSvg(1024));
writeFileSync('assets/adaptive-icon.svg', createIconSvg(1024));
writeFileSync('assets/splash-icon.svg', createSplashSvg(200));
writeFileSync('assets/favicon.svg', createIconSvg(48));

// Convert SVGs to PNGs using sharp-cli
const conversions = [
  ['assets/icon.svg', 'assets/icon.png', 1024],
  ['assets/adaptive-icon.svg', 'assets/adaptive-icon.png', 1024],
  ['assets/splash-icon.svg', 'assets/splash-icon.png', 200],
  ['assets/favicon.svg', 'assets/favicon.png', 48],
];

for (const [src, dest, size] of conversions) {
  try {
    execSync(`npx sharp-cli -i ${src} -o ${dest} resize ${size} ${size}`, { stdio: 'inherit' });
    console.log(`Generated ${dest} (${size}x${size})`);
  } catch (e) {
    console.error(`Failed to convert ${src}: ${e.message}`);
  }
}

console.log('Done! Icon generation complete.');
