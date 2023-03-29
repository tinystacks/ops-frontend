#!/bin/bash

defaultDeps="@tinystacks/ops-core-widgets @tinystacks/ops-aws-core-widgets";
if [ ! -f ".local-dependencies" ];
  then
    touch .local-dependencies;
    echo $defaultDeps > .local-dependencies;
fi

dependencies=$(<.local-dependencies);

if [[ -z "$dependencies" ]];
  then
    echo $defaultDeps > .local-dependencies;
    dependencies=$(<.local-dependencies);
fi

mkdir -p ../dependencies;
depDir=$(cd ../dependencies; pwd);
npm i --silent --prefix $depDir $dependencies --@tinystacks:registry=https://registry.npmjs.org;
node ./generate-plugins-index.js $dependencies;
echo "$depDir"