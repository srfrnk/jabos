FROM k8s.gcr.io/kustomize/kustomize:v4.4.1 as kustomize

FROM ubuntu

COPY --from=kustomize /app/kustomize /usr/bin/kustomize

RUN apt-get update -y &&\
  apt-get install -yy curl wget

RUN useradd -ms /bin/bash user

RUN mkdir /build && chown user /build

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq


COPY ./build.sh /

USER user

ENTRYPOINT ["/build.sh"]
