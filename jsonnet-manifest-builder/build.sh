#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

ROOT_PATH="/gitTemp/${SRC_PATH}"

for file in $(find ${ROOT_PATH} -name '*.jsonnet'); do
  outfile=$(realpath --relative-to ${ROOT_PATH} ${file} | xargs -I{} basename {} .jsonnet)
  bash -c "jsonnet ${file} ${JSONNET_ARGS} > /build/${outfile}.json"
done

yq e -I 2 -P '(. | select(has(0)) | .[] | splitDoc) // .' $(find /build -name '*.json') > /manifests/manifests.yaml
