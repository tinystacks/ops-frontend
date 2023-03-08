FROM public.ecr.aws/docker/library/node:18-slim

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.6.1 /lambda-adapter /opt/extensions/lambda-adapter

ARG NPM_TOKEN
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

WORKDIR /app

COPY . .

RUN mv ./.npmrc ./.npmrc.dev
RUN mv ./.npmrc.prod ./.npmrc
RUN npm ci
RUN npm run build
# RUN rm -rf ./src
# Uncomment once core-plugins repo exists and is installable
# RUN npm prune --production


EXPOSE 3000
CMD ["npm", "start"]