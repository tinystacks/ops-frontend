## How to Use

### Pull the iamge
docker pull public.ecr.aws/tinystacks/ops-frontend:latest

### Run the image in your directory with the console config yaml
#### Optionally mount your aws folder for resolving profiles for auth purposes within the providers
docker run --name ops-frontend -v $HOME/.aws:/root/.aws -v $(pwd):/config --env CONFIG_PATH="../config/example.yml" --env NODE_ENV=production -p 8000:8000 "ops-frontend:latest";