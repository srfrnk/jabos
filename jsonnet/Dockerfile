FROM golang

RUN go get github.com/google/go-jsonnet/cmd/jsonnet

RUN wget https://github.com/mikefarah/yq/releases/download/v4.2.0/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

COPY ./build-manifests.sh /build-manifests.sh
RUN mkdir /build && chown 1000 /build

USER 1000

ENTRYPOINT [ "/bin/bash","-c","/build-manifests.sh $@" ]
