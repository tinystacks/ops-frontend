#!/bin/bash

callerIdentity=$(aws sts get-caller-identity);
accountId=$(jq -r .Account <<< $callerIdentity);
version="${VERSION:-latest}";
sourceTag="${SOURCE_TAG:-latest}"
appName=$(cat ./package.json | jq -r .name);
region="${AWS_REGION:-us-east-1}";
ecrEndpoint="${accountId}.dkr.ecr.${region}.amazonaws.com";
ecrImageUrl="${ecrEndpoint}/${appName}";
publicEcrEndpoint="public.ecr.aws/tinystacks";
publicEcrImageUrl="${publicEcrEndpoint}/${appName}";

# Log in to Dev private registry
docker login -u AWS -p $(aws ecr get-login-password --region $region) $ecrEndpoint;

# Pull Dev images
docker pull $ecrImageUrl:$sourceTag-x86;
docker pull $ecrImageUrl:$sourceTag-arm;

# Log in to public registry
aws ecr-public get-login-password --region $region | docker login --username AWS --password-stdin public.ecr.aws

# Push public images
x86Tag="$version-x86";
docker image tag "$ecrImageUrl:$sourceTag-x86" "$publicEcrImageUrl:$x86Tag";

armTag="$version-arm";
docker image tag "$ecrImageUrl:$sourceTag-arm" "$publicEcrImageUrl:$armTag";

if [ "$version" != "latest" ]
  then
    # Push latest-arch images
    docker image tag "$ecrImageUrl:$sourceTag-x86" "$publicEcrImageUrl:latest-x86";
    docker image tag "$ecrImageUrl:$sourceTag-arm" "$publicEcrImageUrl:latest-arm";
fi

docker push $publicEcrImageUrl --all-tags;

# Create public manifest
export DOCKER_CLI_EXPERIMENTAL=enabled       
docker manifest create $publicEcrImageUrl:$version $publicEcrImageUrl:$armTag $publicEcrImageUrl:$x86Tag    
docker manifest annotate --arch arm64 $publicEcrImageUrl:$version $publicEcrImageUrl:$armTag
docker manifest annotate --arch amd64 $publicEcrImageUrl:$version $publicEcrImageUrl:$x86Tag
docker manifest push $publicEcrImageUrl:$version

if [ "$version" != "latest" ]
  then
    docker manifest create $publicEcrImageUrl:latest $publicEcrImageUrl:$armTag $publicEcrImageUrl:$x86Tag    
    docker manifest annotate --arch arm64 $publicEcrImageUrl:latest $publicEcrImageUrl:$armTag
    docker manifest annotate --arch amd64 $publicEcrImageUrl:latest $publicEcrImageUrl:$x86Tag
    docker manifest push $publicEcrImageUrl:latest
fi

docker manifest inspect $publicEcrImageUrl:latest