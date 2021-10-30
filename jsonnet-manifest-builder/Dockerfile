ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM golang as builder

RUN go get github.com/google/go-jsonnet/cmd/jsonnet

FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl git wget

RUN useradd -ms /bin/bash user

RUN mkdir /build && chown user /build

COPY --from=builder /go/bin/jsonnet /usr/bin/

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN mkdir /gitTemp && chown 1000 /gitTemp

RUN mkdir /home/user/.ssh &&\
  printf "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/user/.ssh/config

COPY ./build.sh /

USER user

ENTRYPOINT ["/build.sh"]
