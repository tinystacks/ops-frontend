#!/bin/bash

defaultDeps="@tinystacks/ops-core-widgets
@tinystacks/ops-aws-core-widgets
@tinystacks/ops-aws-utilization-widgets";

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

getNames=false
while getopts "n" flag; do
  case "$flag" in
    n) getNames=true;;
  esac
done;

oneLinerDependencies="";
while read -r line; do
  IFS=':' read -ra dependency <<< "$line";
  name=""
  if $getNames || [ -z ${dependency[1]} ]; then name=${dependency[0]}; else name=${dependency[1]}; fi;
  oneLinerDependencies+=" ${name}";
done <<< "$dependencies";
oneLinerDependencies=${oneLinerDependencies/ /};

echo "$oneLinerDependencies";