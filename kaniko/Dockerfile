FROM alpine as tools

RUN apk add curl

RUN wget https://github.com/google/go-jsonnet/releases/download/v0.17.0/go-jsonnet_0.17.0_Linux_x86_64.tar.gz -O /jsonnet.tar.gz &&\
  tar -xzf /jsonnet.tar.gz &&\
  chmod +x /jsonnet

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" &&\
  chmod +x /kubectl

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /yq &&\
  chmod +x /yq

ADD https://raw.githubusercontent.com/srfrnk/k8s-jsonnet-libs/main/events.libsonnet /events.libsonnet
RUN chmod 664 /events.libsonnet

FROM busybox as busybox

FROM gcr.io/kaniko-project/executor:latest

COPY --from=busybox / /bb
COPY --from=tools /jsonnet /bb/tools/
COPY --from=tools /kubectl /bb/tools/
COPY --from=tools /yq /bb/tools/
COPY --from=tools /events.libsonnet /bb/tools/

COPY kaniko-runner.sh /bb/tools/
COPY kube-config.yaml /root/.kube/config
COPY error-event.jsonnet /bb/tools/

ENTRYPOINT ["/bb/tools/kaniko-runner.sh"]
