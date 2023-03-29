const path = require('path');
const fs = require('fs');
const camelCase = require('lodash.camelcase');

const processArgs = [...process.argv];
const dependencies = processArgs.slice(2);
const importStatements = dependencies.map((dependency) => {
  const moduleNamespace = camelCase(dependency);
  return `export * as ${moduleNamespace} from '${dependency}';`;
});

const eslintDisable = '/* eslint-disable import/no-unresolved */';
const tsNoCheck = '// @ts-nocheck';
const eslintEnable = '/* eslint-enable import/no-unresolved */';
const pluginIndex = [
  eslintDisable,
  tsNoCheck,
  ...importStatements,
  eslintEnable
];

const pluginIndexContent = pluginIndex.join('\n');

fs.writeFileSync(path.resolve('./src/plugins.ts'), pluginIndexContent);