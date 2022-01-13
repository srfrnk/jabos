#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

ROOT_PATH="/gitTemp/${SRC_PATH}"

eval helm template ${VALUES} ${ROOT_PATH} > /manifests/manifests.yaml
