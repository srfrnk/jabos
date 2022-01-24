#! /bin/bash

ROOT_PATH="/gitTemp/${SRC_PATH}"

set -o pipefail
ERROR_MESSAGE=$(bash -c "helm template ${VALUES} ${ROOT_PATH} > /manifests/manifests.yaml" 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  source exit-error.sh
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
else
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
fi
