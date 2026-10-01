#!/usr/bin/env node
// Runs the Expo CLI with the web SSR global shims preloaded, so `npm start`,
// `npm run export:server` and friends work the same on every platform.
//
// The shim has to reach the Node processes the CLI spawns for server rendering,
// and NODE_OPTIONS is the only way to get code into them. It is given as a
// path relative to the project root because NODE_OPTIONS splits on whitespace
// and eats backslashes, so an absolute Windows path is not safe to embed here.

const path = require('path');
const { spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const preload = './' + path.relative(projectRoot, path.join(__dirname, 'web-ssr-globals.cjs')).split(path.sep).join('/');

const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require ${preload}`].filter(Boolean).join(' '),
  },
});

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
