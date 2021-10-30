FROM golang

RUN go get github.com/google/go-jsonnet/cmd/jsonnet

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN useradd -ms /bin/bash user

COPY ./build-manifests.sh /build-manifests.sh
RUN mkdir /build && chown user /build

USER user

ENTRYPOINT [ "/bin/bash","-c","/build-manifests.sh $@" ]
