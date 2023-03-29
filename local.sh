#!/bin/bash

## Install runtime dependencies
depDir=$(bash ./install-runtime-dependencies.sh);

## Setup environment variables
rm -rf ./.env.local;
echo API_ENDPOINT=http://localhost:8000 > ./.env.local;
echo MOUNTED_DEPENDENCIES=true >> ./.env.local;