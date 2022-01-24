ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN mkdir /build && chown user /build

COPY ./build.sh /
COPY ./exit-error.sh /
COPY ./error-event.jsonnet /

USER 1000

ENTRYPOINT ["/build.sh"]
