#! /bin/bash

ROOT_PATH="/gitTemp/${SRC_PATH}"

for file in $(find ${ROOT_PATH} -name '*.jsonnet'); do
  outfile=$(realpath --relative-to ${ROOT_PATH} ${file} | xargs -I{} basename {} .jsonnet)

  set -o pipefail
  ERROR_MESSAGE=$(bash -c "jsonnet ${file} ${JSONNET_ARGS} > /build/${outfile}.json" 2>&1 | tee /dev/tty)

  if [ $? -ne 0 ]; then
    source exit-error.sh
    echo "Exiting"
    sleep 10 # Just to allow fluentd gathering logs before termination
    exit 1
  fi
done

yq e -I 2 -P '(. | select(has(0)) | .[] | splitDoc) // .' $(find /build -name '*.json') > /manifests/manifests.yaml

echo "Exiting"
sleep 10 # Just to allow fluentd gathering logs before termination
