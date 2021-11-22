#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

SRC_PATH=$1
COMMIT_REPLACEMENT_STRING=$2
COMMIT=$3

ROOT_PATH="/gitTemp/${SRC_PATH}"

for file in $(find ${ROOT_PATH} -name '*.yaml' -o -name '*.yml' -o -name '*.json'); do
  outfile=$(realpath --relative-to ${ROOT_PATH} ${file} | xargs -I{} basename {})
  sed "s/${COMMIT_REPLACEMENT_STRING}/${COMMIT}/g" ${file} > /build/${outfile}
done

yq e -I 2 -P '(. | select(has(0)) | .[] | splitDoc) // .' $(find /build -name '*.yaml' -o -name '*.yml' -o -name '*.json') > /manifests/manifests.yaml
