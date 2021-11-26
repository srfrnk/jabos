FROM ubuntu

RUN apt-get update -y &&\
  apt-get install -yy curl wget gnupg2 apt-transport-https

RUN useradd -ms /bin/bash user

RUN mkdir /build && chown user /build

RUN curl https://baltocdn.com/helm/signing.asc | apt-key add - &&\
  echo "deb https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list &&\
  apt-get update -y &&\
  apt-get install helm

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

COPY ./build.sh /

USER user

ENTRYPOINT ["/build.sh"]
