ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}base-manifest-builder${IMAGE_VERSION} as base-manifest-builder

USER root

COPY ./build.sh /

USER user
