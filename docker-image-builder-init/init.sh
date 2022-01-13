#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

# DOCKER_CONFIG=$(printf "%b" "$6" | base64 -d)

printf "%b" "${DOCKER_CONFIG}" > /kaniko/.docker/config.json

if [ -n "${DOCKER_HUB_USERNAME}" ]; then
  AUTH=$(printf "%b" "${DOCKER_HUB_USERNAME}:${DOCKER_HUB_PASSWORD}" | base64 -w 0)
  yq e -i -o=json -I=0 ".auths[\"https://index.docker.io/v1/\"].auth=\"${AUTH}\"" /kaniko/.docker/config.json
fi

if [ -f "/secrets/gcp_service_account.json" ]; then
  AUTH=$(printf "%s" "_json_key:$(cat /secrets/gcp_service_account.json)" | base64 -w 0)
  yq e -i -o=json -I=0 ".auths[\"${HOST}\"].auth=\"${AUTH}\"" /kaniko/.docker/config.json
fi

if [ -f "/secrets/aws_access_key_id" ]; then
  yq e -i -o=json -I=0 ".credsStore=\"ecr-login\"" /kaniko/.docker/config.json
  printf "%b" "[default]\naws_access_key_id=$(cat /secrets/aws_access_key_id)\naws_secret_access_key=$(cat /secrets/aws_secret_access_key)" > /kaniko/.aws/credentials
fi

if [[ "BUILD_IMAGE" != "${REUSE_IMAGE}" ]]; then
  echo "FROM ${REUSE_IMAGE}" > /reuse/Dockerfile
fi
