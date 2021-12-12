ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}base-manifest-builder${IMAGE_VERSION} as base-manifest-builder

USER root

RUN wget https://get.helm.sh/helm-v3.7.2-linux-amd64.tar.gz -O - | tar -xz && \
  mv linux-amd64/helm /usr/bin/helm && \
  chmod +x /usr/bin/helm && \
  rm -rf linux-amd64

COPY ./build.sh /

USER 1000
