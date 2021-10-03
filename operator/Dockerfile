FROM node:lts-alpine

RUN apk add curl git docker

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

RUN mkdir /tempGit && chown 1000 /tempGit

USER 1000

ENTRYPOINT ["npx","nodemon"]
CMD ["index.ts"]
