ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl wget

RUN useradd -ms /bin/bash user

COPY ./init.sh /

USER user

ENTRYPOINT ["/init.sh"]
