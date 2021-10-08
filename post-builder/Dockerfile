FROM alpine

RUN apk add curl git

RUN \
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" &&\
  chmod u+x kubectl && mv kubectl /bin/kubectl

COPY ./post-build.sh /

USER 1000

ENTRYPOINT ["/post-build.sh"]
