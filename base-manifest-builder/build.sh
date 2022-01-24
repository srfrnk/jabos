#! /bin/bash

ROOT_PATH="/gitTemp/${SRC_PATH}"

set -o pipefail
# Build manifests into /manifests/manifests.yaml:
ERROR_MESSAGE=$(touch /manifests/manifests.yaml 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  ./exit-error.sh
else
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
fi
