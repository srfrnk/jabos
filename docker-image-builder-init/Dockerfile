FROM alpine

RUN apk add --update curl wget bash

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN adduser -s /bin/bash -S user -u 1000

COPY ./init.sh /

USER 1000

ENTRYPOINT ["/init.sh"]
