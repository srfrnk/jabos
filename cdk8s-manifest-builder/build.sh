#! /bin/bash

ROOT_PATH="/gitTemp/${SRC_PATH}"

cd ${ROOT_PATH}

LANG=$(yq e ".language" cdk8s.yaml)

case "${LANG}" in
  "go")
    SETUP="&&"
    ;;
  "java")
    SETUP="&& mvn compile &&"
    ;;
  "python")
    SETUP="&& pipenv install &&"
    ;;
  "typescript")
    SETUP="&& npm install && npm run compile &&"
    ;;
esac

set -o pipefail
ERROR_MESSAGE=$(bash -c "cdk8s import ${SETUP} cdk8s synth" 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  source /exit-error.sh
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
fi

yq e -I 2 -P '(. | select(has(0)) | .[] | splitDoc) // .' $(find ./dist -name '*.yaml') > /manifests/manifests.yaml

echo "Exiting"
sleep 10 # Just to allow fluentd gathering logs before termination
