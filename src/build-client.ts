import esbuild from 'esbuild';

import packageJson from '../package.json';

const devDependencies = Object.keys(packageJson.devDependencies || {});

esbuild
  .build({
    entryPoints: ['./src/client/index.ts'],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es6'],
    outfile: './dist/js/client/index.min.js',
    format: 'esm',
    external: devDependencies,
  })
  .catch(() => process.exit(1));
