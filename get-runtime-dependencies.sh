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

echo "$dependencies"