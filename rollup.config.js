import path from 'node:path';
import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';

const input = './src/safe-data.ts';
const outputDir = {
  types: './types',
  esm: './esm',
  cjs: './cjs',
};
export default [
  // Types
  {
    input,
    output: {
      dir: outputDir.types,
      format: 'es',
    },
    plugins: [
      del({ targets: outputDir.types }),
      del({
        targets: path.join(outputDir.types, '/safe-data.js'),
        hook: 'writeBundle',
      }),
      typescript({
        removeComments: false,
        declaration: true,
        declarationDir: outputDir.types,
      }),
    ],
  },

  // ES modules
  {
    input,
    output: {
      dir: outputDir.esm,
      format: 'es',
      preserveModules: true,
    },
    plugins: [
      del({ targets: outputDir.esm }),
      typescript(),
    ],
  },

  // CommonJS modules
  {
    input,
    output: {
      dir: outputDir.cjs,
      format: 'cjs',
      exports: 'named',
      preserveModules: true,
      entryFileNames: '[name].cjs',
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
      },
    },
    plugins: [
      del({ targets: outputDir.cjs }),
      typescript(),
    ],
  },
];
