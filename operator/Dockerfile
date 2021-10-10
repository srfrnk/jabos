FROM node:lts

RUN apt-get update -y
RUN apt-get install -yy curl git wget

WORKDIR /app
COPY ./package*.json /app/
RUN npm install

COPY . /app

RUN mkdir /tempGit && chown 1000 /tempGit

USER 1000

ENTRYPOINT ["npx","nodemon"]
CMD ["index.ts"]
