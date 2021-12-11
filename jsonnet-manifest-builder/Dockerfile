ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}base-manifest-builder${IMAGE_VERSION} as base-manifest-builder

USER root

RUN wget https://github.com/google/go-jsonnet/releases/download/v0.17.0/go-jsonnet_0.17.0_Linux_x86_64.tar.gz -O jsonnet.tar.gz &&\
  tar -xzf jsonnet.tar.gz &&\
  rm jsonnet.tar.gz &&\
  mv jsonnet /usr/bin/jsonnet &&\
  chmod +x /usr/bin/jsonnet

COPY ./build.sh /

USER 1000
