FROM ubuntu

RUN apt-get update -y &&\
  apt-get install -yy curl wget

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN useradd -ms /bin/bash user

COPY ./init.sh /

USER user

ENTRYPOINT ["/init.sh"]
