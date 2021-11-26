#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

SRC_PATH=$1
COMMIT_KEY=$2
COMMIT_VALUE=$3

ROOT_PATH="/gitTemp/${SRC_PATH}"

helm template --set-string "${COMMIT_KEY}=${COMMIT_VALUE}" ${ROOT_PATH} > /manifests/manifests.yaml
