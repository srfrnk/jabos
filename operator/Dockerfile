ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM node:lts

RUN apt-get update -y
RUN apt-get install -yy curl git wget

RUN mkdir /home/node/.ssh &&\
  printf "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/node/.ssh/config

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

RUN mkdir /tempGit && chown node /tempGit

USER node

ENTRYPOINT ["./start.sh"]
