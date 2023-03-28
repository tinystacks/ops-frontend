#!/bin/bash
NPM_TOKEN=$(cat ~/.npmrc | grep '^//npm.pkg.github.com' | cut -d "=" -f2-);
version=$(cat ./package.json | jq -r .version);
appName=$(cat ./package.json | jq -r .name);

depDir=$(bash ./install-runtime-dependencies.sh);

if [ ! -f "./.env.staging" ];
  then
    echo AWS_REGION_OVERRIDE=us-west-2 > ./.env.staging;
    echo AWS_PROFILE_OVERRIDE=ts >> ./.env.staging;
    echo API_ENDPOINT=http://ops-api:8000 >> ./.env.staging;
    echo MOUNTED_DEPENDENCIES=true >> ./.env.staging;
    echo API_KEY_ID=fix-me >> ./.env.staging;
fi

cp ./.env.staging ./.env.local;
docker network create -d bridge ops-console 2> /dev/null;
docker build \
  --progress plain \
  --build-arg NPM_TOKEN=${NPM_TOKEN} \
  -t "$appName:$version" . || exit 1;
docker container stop $appName || true;
docker container rm $appName || true;
docker run --name $appName \
  -v $HOME/.aws:/root/.aws \
  -v $depDir:/dependencies \
  -it \
  -p 3000:3000 \
  --env-file ./.env.staging \
  --network=ops-console \
  "$appName:$version";