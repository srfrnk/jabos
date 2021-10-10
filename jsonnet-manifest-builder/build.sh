#! /bin/bash

set -e

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3
SRC_PATH=$4
TARGET_NAMESPACE=$5
JSONNET_ARGS=$6

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}

ROOT_PATH="/gitTemp/${SRC_PATH}"

for file in $(find ${ROOT_PATH} -name '*.jsonnet'); do
  outfile=$(realpath --relative-to ${ROOT_PATH} ${file} | xargs -I{} basename {} .jsonnet)
  bash -c "jsonnet ${file} ${JSONNET_ARGS} > /build/${outfile}.json"
done

yq e -I 2 -P '(. | select(has(0))| .[] | splitDoc) // .' $(find /build -name '*.json')
