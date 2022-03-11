FROM node:lts-alpine

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

RUN npm run compile && npm run test

USER 1000

ENTRYPOINT ["./start.sh"]
