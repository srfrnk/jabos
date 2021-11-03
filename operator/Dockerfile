ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM node:lts

RUN apt-get update -y
RUN apt-get install -yy curl wget

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

USER node

ENTRYPOINT ["./start.sh"]
