#!/bin/bash

## Install runtime dependencies
dependencies=$(bash ./get-runtime-dependencies.sh);
echo $dependencies;
npm i --no-save --silent $dependencies --@tinystacks:registry=https://registry.npmjs.org;
dependencyNames=$(bash ./get-runtime-dependencies.sh -n);
echo $dependencyNames;
node ./generate-plugins-index.js $dependencyNames;

## Setup environment variables
rm -rf ./.env.local;
echo API_ENDPOINT=http://localhost:8000 > ./.env.local;
echo MOUNTED_DEPENDENCIES=true >> ./.env.local;