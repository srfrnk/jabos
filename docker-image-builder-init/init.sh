#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

IMAGE=$1
DOCKER_CONFIG=$(echo -n "$2" | base64 -d)

echo "Args: $1 ${DOCKER_CONFIG}"

if [ -n "${DOCKER_HUB_USERNAME}" ]; then
  AUTH=$(echo -n ${DOCKER_HUB_USERNAME}:${DOCKER_HUB_PASSWORD} | base64)
  DOCKER_CONFIG=$(echo ''"${DOCKER_CONFIG}"'' | yq e -o=json -I=0 ".auths[\"https://index.docker.io/v1/\"].auth=\"${AUTH}\"" -)
fi

if [ -f "/secrets/gcp_service_account.json" ]; then
  AUTH=$(echo -n "_json_key:$(cat /secrets/gcp_service_account.json)" | base64)
  HOST=$(echo "${IMAGE}" | cut -d/ -f1)
  echo "HOST: ${HOST}"
  DOCKER_CONFIG=$(echo ''"${DOCKER_CONFIG}"'' | yq e -o=json -I=0 ".auths[\"${HOST}\"].auth=\"${AUTH}\"" -)
fi

if [ -f "/secrets/aws_access_key_id" ]; then
  DOCKER_CONFIG=$(echo ''"${DOCKER_CONFIG}"'' | yq e -o=json -I=0 ".credsStore=\"ecr-login\"" -)
  printf "[default]\naws_access_key_id=$(cat /secrets/aws_access_key_id)\naws_secret_access_key=$(cat /secrets/aws_secret_access_key)" > /kaniko/.aws/credentials
fi

printf "${DOCKER_CONFIG}" > /kaniko/.docker/config.json
