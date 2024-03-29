const path = require('path');
const fs = require('fs');
const camelCase = require('lodash.camelcase');

const processArgs = [...process.argv];
const dependencies = processArgs.slice(2);

const importStatements = dependencies?.map((dependency) => {
  const packageName = `@${dependency.split('@')?.at(1)}`;
  const moduleNamespace = camelCase(packageName);
  const moduleImport = `export * as ${moduleNamespace} from '${packageName}';`;
  const moduleSchemaImport = `export * as ${moduleNamespace}Schema from '${packageName}/dist/ops-types.json';`;
  return `${moduleImport}\n${moduleSchemaImport}`;
});

if (importStatements.length === 0) {
  importStatements.push('export {};');
}

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