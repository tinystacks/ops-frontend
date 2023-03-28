#!/bin/bash
NPM_TOKEN=$(cat ~/.npmrc | grep '^//npm.pkg.github.com' | cut -d "=" -f2-);
version=$(cat ./package.json | jq -r .version);
appName=$(cat ./package.json | jq -r .name);

depDir=$(bash ./install-runtime-dependencies.sh);

if [ ! -f "./.env.dev" ];
  then
    echo AWS_REGION=us-west-2 > ./.env.dev;
    echo API_ENDPOINT=http://ops-api:8000 >> ./.env.dev;
    echo MOUNTED_DEPENDENCIES=true >> ./.env.dev;
fi

cp ./.env.dev ./.env.local;
docker network create -d bridge ops-console 2> /dev/null;
docker build \
  --progress plain \
  --build-arg NPM_TOKEN=${NPM_TOKEN} \
  -t "$appName:$version" . || exit 1;
docker container stop $appName || true;
docker container rm $appName || true;
docker run --name $appName \
  -it \
  -p 3000:3000 \
  -v $depDir:/dependencies \
  --env-file ./.env.dev \
  --network=ops-console \
  "$appName:$version";