#!/bin/bash
NPM_TOKEN=$(cat ~/.npmrc | grep '^//npm.pkg.github.com' | cut -d "=" -f2-);
version=$(cat ./package.json | jq -r .version);
appName=$(cat ./package.json | jq -r .name);
docker build \
  --progress plain \
  --build-arg NPM_TOKEN=${NPM_TOKEN} \
  -t "$appName:$version" . || exit 1;
docker container stop $appName || true
docker container rm $appName || true
docker run --name $appName -it -p 3000:3000 "$appName:$version";