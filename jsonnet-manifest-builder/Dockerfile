FROM golang as builder

RUN go get github.com/google/go-jsonnet/cmd/jsonnet

FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl git wget

RUN mkdir /build && chown 1000 /build

COPY --from=builder /go/bin/jsonnet /usr/bin/

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

COPY ./build.sh /
RUN mkdir /gitTemp && chown 1000 /gitTemp

USER 1000

ENTRYPOINT ["/build.sh"]
