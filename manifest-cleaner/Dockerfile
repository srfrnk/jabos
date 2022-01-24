ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

COPY ./clean.sh /
COPY ./error-event.jsonnet /

ENTRYPOINT ["/clean.sh"]
