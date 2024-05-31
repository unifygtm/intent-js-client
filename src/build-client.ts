import esbuild from 'esbuild';

import packageJson from '../package.json';

const devDependencies = Object.keys(packageJson.devDependencies || {});

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['./src/client/index.ts'],
      bundle: true,
      minify: true,
      platform: 'browser',
      target: ['es6'],
      outfile: './dist/js/client/index.esm.js',
      format: 'esm',
      external: devDependencies,
    });

    await esbuild.build({
      entryPoints: ['./src/client/index.ts'],
      bundle: true,
      minify: true,
      platform: 'browser',
      target: ['es6'],
      outfile: './dist/js/client/index.cjs.js',
      format: 'cjs',
      external: devDependencies,
    });
  } catch {
    process.exit(1);
  }
}

build();
