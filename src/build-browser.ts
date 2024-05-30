import esbuild from 'esbuild';

import packageJson from '../package.json';

const devDependencies = Object.keys(packageJson.devDependencies || {});

esbuild
  .build({
    entryPoints: ['./src/browser/index.ts'],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es6'],
    outfile: './dist/js/browser/index.min.js',
    external: devDependencies,
  })
  .catch(() => process.exit(1));
