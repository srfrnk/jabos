FROM ubuntu

RUN apt-get update -y
RUN apt-get install -yy curl git wget

RUN \
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" &&\
  chmod +x kubectl && mv kubectl /bin/kubectl

RUN useradd -ms /bin/bash user

COPY ./deploy.sh /
COPY ./kube-config.yaml /home/user/.kube/config

RUN chown -R user /home/user

USER user

ENTRYPOINT ["/deploy.sh"]
