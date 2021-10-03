# FROM gcr.io/kaniko-project/executor:latest
FROM alpine

RUN apk add curl git

COPY ./init.sh /

USER 1000

ENTRYPOINT ["/init.sh"]
