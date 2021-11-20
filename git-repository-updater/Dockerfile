ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN apt-get install -yy bc git

RUN mkdir /gitTemp && chown user /gitTemp

RUN mkdir /home/user/.ssh &&\
  printf "Host *\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config &&\
  touch /home/user/.ssh/known_hosts &&\
  chown user /home/user/.ssh/known_hosts

COPY ./get_latest_commit.sh /

USER user

ENTRYPOINT ["/get_latest_commit.sh"]
