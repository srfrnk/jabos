ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION}

USER root

RUN apk add --update bc

RUN wget https://github.com/google/go-jsonnet/releases/download/v0.17.0/go-jsonnet_0.17.0_Linux_x86_64.tar.gz -O jsonnet.tar.gz &&\
  tar -xzf jsonnet.tar.gz &&\
  rm jsonnet.tar.gz &&\
  mv jsonnet /usr/bin/jsonnet &&\
  chmod +x /usr/bin/jsonnet

ADD https://raw.githubusercontent.com/srfrnk/k8s-jsonnet-libs/main/events.libsonnet /events.libsonnet
RUN chmod 664 /events.libsonnet

COPY ./post-build.sh /
COPY ./status.jsonnet /

USER 1000

ENTRYPOINT ["/post-build.sh"]
