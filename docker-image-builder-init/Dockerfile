FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl git wget

COPY ./init.sh /

USER 1000

ENTRYPOINT ["/init.sh"]
