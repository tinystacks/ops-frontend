FROM public.ecr.aws/docker/library/node:18-slim

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.6.1 /lambda-adapter /opt/extensions/lambda-adapter

ARG NPM_TOKEN
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000
ARG DEPENDENCIES
ENV DEPENDENCIES=${DEPENDENCIES}

WORKDIR /app

COPY . .

RUN npm ci
RUN if [ ! -z "${DEPENDENCIES}" ]; then npm i $DEPENDENCIES; fi;
RUN node ./generate-plugins-index.cjs $DEPENDENCIES;
RUN npm run build
# RUN rm -rf ./src
RUN npm prune --production


EXPOSE 3000
CMD ["npm", "start"]