ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION}

USER root

RUN apt-get install -yy bc

USER user

COPY ./post-build.sh /

ENTRYPOINT ["/post-build.sh"]
