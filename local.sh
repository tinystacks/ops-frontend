#!/bin/bash

## Install runtime dependencies
dependencies=$(bash ./get-runtime-dependencies.sh);
npm i --no-save --silent $dependencies --@tinystacks:registry=https://registry.npmjs.org;
node ./generate-plugins-index.js $dependencies;

## Setup environment variables
rm -rf ./.env.local;
echo API_ENDPOINT=http://localhost:8000 > ./.env.local;
echo MOUNTED_DEPENDENCIES=true >> ./.env.local;