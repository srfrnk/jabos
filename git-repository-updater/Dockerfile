ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN apk add --update bc git openssh-client

RUN mkdir /home/user/.ssh &&\
  printf "Host *\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config &&\
  touch /home/user/.ssh/known_hosts &&\
  chown user /home/user/.ssh/known_hosts

RUN wget https://github.com/google/go-jsonnet/releases/download/v0.17.0/go-jsonnet_0.17.0_Linux_x86_64.tar.gz -O jsonnet.tar.gz &&\
  tar -xzf jsonnet.tar.gz &&\
  rm jsonnet.tar.gz &&\
  mv jsonnet /usr/bin/jsonnet &&\
  chmod +x /usr/bin/jsonnet

ADD https://raw.githubusercontent.com/srfrnk/k8s-jsonnet-libs/main/events.libsonnet /events.libsonnet
RUN chmod 664 /events.libsonnet

COPY ./get_latest_commit.sh /
COPY ./error-event.jsonnet /

USER 1000

ENTRYPOINT ["/get_latest_commit.sh"]
