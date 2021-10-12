#! /bin/bash

set -e

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3
SRC_PATH=$4
JSONNET_ARGS=$5

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}

ROOT_PATH="/gitTemp/${SRC_PATH}"

for file in $(find ${ROOT_PATH} -name '*.jsonnet'); do
  outfile=$(realpath --relative-to ${ROOT_PATH} ${file} | xargs -I{} basename {} .jsonnet)
  bash -c "jsonnet ${file} ${JSONNET_ARGS} > /build/${outfile}.json"
done

yq e -I 2 -P '(. | select(has(0))| .[] | splitDoc) // .' $(find /build -name '*.json') > /manifests/manifests.yaml

# TODO: upload the manifests yaml to a package/version manager for auditing

sleep 5 # Just to allow fluentd gathering logs before termination
