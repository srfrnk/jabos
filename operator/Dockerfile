FROM node:lts-alpine

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

USER 1000

RUN npx tsc --noEmit

ENTRYPOINT ["./start.sh"]
