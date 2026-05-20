const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

if (process.env.ELECTRON_DEV === '1') {
  env.ELECTRON_DEV = '1';
}

const isLauncher = process.env.ELECTRON_LAUNCHER === '1';

const electronPath = require('electron');

if (isLauncher) {
  const child = spawn(electronPath, ['.'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
    env,
    detached: true,
    windowsHide: true,
  });
  child.unref();
  process.exit(0);
} else {
  const child = spawn(electronPath, ['.'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env,
    windowsHide: false,
  });
  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}
