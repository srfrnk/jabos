ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ubuntu

RUN apt-get update -y &&\
  apt-get install -yy curl wget

RUN \
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" &&\
  chmod +x kubectl && mv kubectl /bin/kubectl

RUN wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq &&\
  chmod +x /usr/bin/yq

RUN useradd -ms /bin/bash user

COPY ./kubectl-setup.sh /
COPY ./kube-config.yaml /home/user/.kube/config

RUN chown -R user /home/user

USER user

ENTRYPOINT ["/setup.sh"]
