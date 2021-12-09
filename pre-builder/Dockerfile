FROM alpine

RUN apk add --update curl git bash openssh-client

RUN adduser -s /bin/bash -S user

RUN mkdir /home/user/.ssh &&\
  printf "Host *\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config &&\
  touch /home/user/.ssh/known_hosts &&\
  chown user /home/user/.ssh/known_hosts

COPY ./pre-build.sh /

USER user

ENTRYPOINT ["/pre-build.sh"]
