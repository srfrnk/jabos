ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl git wget

RUN useradd -ms /bin/bash user

RUN mkdir /home/user/.ssh &&\
  printf "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config &&\
  touch /home/user/.ssh/known_hosts &&\
  chown user /home/user/.ssh/known_hosts

COPY ./pre-build.sh /

USER user

ENTRYPOINT ["/pre-build.sh"]
