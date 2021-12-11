ARG IMAGE_PREFIX
ARG IMAGE_VERSION

FROM k8s.gcr.io/kustomize/kustomize:v4.4.1 as kustomize

FROM ${IMAGE_PREFIX}base-manifest-builder${IMAGE_VERSION} as base-manifest-builder

USER root

COPY --from=kustomize /app/kustomize /usr/bin/kustomize

COPY ./build.sh /

USER 1000
