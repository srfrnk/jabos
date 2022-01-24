FROM alpine

RUN apk add --update curl wget bash coreutils

RUN \
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" &&\
  chmod +x kubectl && mv kubectl /bin/kubectl

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN wget https://github.com/google/go-jsonnet/releases/download/v0.17.0/go-jsonnet_0.17.0_Linux_x86_64.tar.gz -O jsonnet.tar.gz &&\
  tar -xzf jsonnet.tar.gz &&\
  rm jsonnet.tar.gz &&\
  mv jsonnet /usr/bin/jsonnet &&\
  chmod +x /usr/bin/jsonnet

ADD https://raw.githubusercontent.com/srfrnk/k8s-jsonnet-libs/main/events.libsonnet /events.libsonnet
RUN chmod o+r /events.libsonnet

RUN adduser -s /bin/bash -S user -u 1000

COPY ./kubectl-setup.sh /
COPY ./kube-config.yaml /home/user/.kube/config

RUN chown -R user /home/user

USER 1000

ENTRYPOINT ["/setup.sh"]
