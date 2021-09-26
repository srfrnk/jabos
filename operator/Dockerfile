FROM node:alpine

COPY . /app
WORKDIR /app

RUN npm install

USER 1000

ENTRYPOINT ["npm"]
CMD ["start"]
