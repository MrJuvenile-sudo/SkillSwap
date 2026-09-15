import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const nodeModulesDir = path.join(rootDir, 'node_modules');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (!fs.existsSync(nodeModulesDir)) {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
  }

  // 1. Setup hatchable in node_modules
  const hatchableSrc = path.join(rootDir, 'hatchable');
  const hatchableDest = path.join(nodeModulesDir, 'hatchable');
  if (fs.existsSync(hatchableSrc)) {
    copyDirSync(hatchableSrc, hatchableDest);
    console.log('✓ Synced hatchable package into node_modules');
  }

  // 2. Setup lib in node_modules
  const libSrc = path.join(rootDir, 'lib');
  const libDest = path.join(nodeModulesDir, 'lib');
  if (fs.existsSync(libSrc)) {
    // If libDest exists and is a symlink or directory, check
    if (!fs.existsSync(libDest)) {
      copyDirSync(libSrc, libDest);
      console.log('✓ Synced lib package into node_modules');
    }
  }
} catch (err) {
  console.warn('Warning during postinstall setup:', err.message);
}
