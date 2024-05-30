import esbuild from 'esbuild';

import packageJson from '../package.json';

// Extract devDependencies keys as an array
const devDependencies = Object.keys(packageJson.devDependencies || {});

esbuild
  .build({
    entryPoints: ['./src/client/index.ts'],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es6'],
    outfile: './dist/minjs/intent-client.js',
    external: devDependencies, // Mark devDependencies as external so they're not included in the bundle
  })
  .catch(() => process.exit(1));
