#!/bin/bash

callerIdentity=$(aws sts get-caller-identity);
accountId=$(jq -r .Account <<< $callerIdentity);
version="${VERSION:-latest}";
appName=$(cat ./package.json | jq -r .name);
region="${AWS_REGION:-us-east-1}";
ecrEndpoint="${accountId}.dkr.ecr.${region}.amazonaws.com";
ecrImageUrl="${ecrEndpoint}/${appName}";

docker login -u AWS -p $(aws ecr get-login-password --region $region) $ecrEndpoint;

x86Tag="$IMAGE_TAG-x86";
x86Image=$(aws ecr describe-images --registry-id "$accountId" --repository-name "$appName" --image-ids imageTag="$x86Tag" 2> /dev/null);
if [ -z "$x86Image" ];
  then
    echo "Image with tag $x86Tag does not exist yet."
    echo "exiting..."
    exit 0;
fi

armTag="$IMAGE_TAG-arm";
armImage=$(aws ecr describe-images --registry-id "$accountId" --repository-name "$appName" --image-ids imageTag="$armTag" 2> /dev/null);
if [ -z "$armImage" ];
  then
    echo "Image with tag $armTag does not exist yet."
    echo "exiting..."
    exit 0;
fi

export DOCKER_CLI_EXPERIMENTAL=enabled       
docker manifest create $ecrImageUrl:$version $ecrImageUrl:$armTag $ecrImageUrl:$x86Tag    
docker manifest annotate --arch arm64 $ecrImageUrl:$version $ecrImageUrl:$armTag
docker manifest annotate --arch amd64 $ecrImageUrl:$version $ecrImageUrl:$x86Tag
docker manifest push $ecrImageUrl:$version

if [ "$version" != "latest" ]
  then
    docker manifest create $ecrImageUrl:latest $ecrImageUrl:$armTag $ecrImageUrl:$x86Tag    
    docker manifest annotate --arch arm64 $ecrImageUrl:latest $ecrImageUrl:$armTag
    docker manifest annotate --arch amd64 $ecrImageUrl:latest $ecrImageUrl:$x86Tag
    docker manifest push $ecrImageUrl:latest
fi

docker manifest inspect $ecrImageUrl:latest