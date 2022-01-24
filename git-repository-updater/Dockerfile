ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN apk add --update bc git openssh-client

RUN mkdir /home/user/.ssh &&\
  printf "Host *\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config &&\
  touch /home/user/.ssh/known_hosts &&\
  chown user /home/user/.ssh/known_hosts

COPY ./get_latest_commit.sh /
COPY ./error-event.jsonnet /
COPY ./status.jsonnet /

USER 1000

ENTRYPOINT ["/get_latest_commit.sh"]
