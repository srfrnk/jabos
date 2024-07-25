FROM node:20.15.1-alpine3.20

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

RUN npm run compile && npm run test

USER 1000

ENTRYPOINT ["./start.sh"]
