#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

DOCKER_CONFIG=$(echo -n "$1" | base64 -d)

echo "Args: ${DOCKER_CONFIG}"

if [ -n "${DOCKER_HUB_USERNAME}" ]; then
  AUTH=$(echo -n ${DOCKER_HUB_USERNAME}:${DOCKER_HUB_PASSWORD} | base64)
  DOCKER_CONFIG=$(echo ''"${DOCKER_CONFIG}"'' | yq e -o=json -I=0 ".auths[\"https://index.docker.io/v1/\"].auth=\"${AUTH}\"" -)
fi

echo -n "${DOCKER_CONFIG}" > /kaniko/.docker/config.json
