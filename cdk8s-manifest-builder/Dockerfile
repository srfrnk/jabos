ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM ${IMAGE_PREFIX}base-manifest-builder${IMAGE_VERSION} as base-manifest-builder

USER root

RUN apk add --update nodejs npm python3 py3-pip openjdk17 maven go
RUN pip install pipenv
RUN npm install -g cdk8s-cli

COPY ./build.sh /

USER 1000
