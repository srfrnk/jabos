ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION}

USER root

RUN apk add --update bc

USER 1000

COPY ./post-build.sh /

ENTRYPOINT ["/post-build.sh"]
