#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

DOCKER_CONFIG=$1

echo -n "${DOCKER_CONFIG}" | base64 -d > /kaniko/.docker/config.json
