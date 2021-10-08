FROM alpine

RUN apk add curl git

COPY ./build.sh /
RUN mkdir /gitTemp && chown 1000 /gitTemp

USER 1000

ENTRYPOINT ["/build.sh"]
