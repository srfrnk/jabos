ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM node:lts

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

USER node

ENTRYPOINT ["./start.sh"]
