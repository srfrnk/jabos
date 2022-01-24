ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN apk add --update bc

COPY ./post-build.sh /
COPY ./status.jsonnet /

USER 1000

ENTRYPOINT ["/post-build.sh"]
