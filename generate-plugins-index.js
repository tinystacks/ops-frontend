import path from 'path';
import fs from 'fs';
import camelCase from 'lodash.camelcase';

const processArgs = [...process.argv];
const dependencies = processArgs.slice(2);

const importStatements = dependencies?.map((dependency) => {
  const packageName = `@${dependency.split('@')?.at(1)}`;
  const moduleNamespace = camelCase(packageName);
  return `export * as ${moduleNamespace} from '${packageName}';`;
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