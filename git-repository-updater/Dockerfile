ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}kubectl${IMAGE_VERSION} as kubectl

USER root

RUN mkdir /gitTemp && chown user /gitTemp

RUN mkdir /home/user/.ssh &&\
  printf "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config

COPY ./get_latest_commit.sh /

USER user

ENTRYPOINT ["/get_latest_commit.sh"]
