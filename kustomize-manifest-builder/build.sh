#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

SRC_PATH=$1
COMMIT=$2
shift 2

ROOT_PATH="/gitTemp/${SRC_PATH}"

cp -R ${ROOT_PATH} /tmp/kustomize

for image in $@; do
  yq e -i ".images |= . + [{\"name\":\"${image}\",\"newTag\":\"${COMMIT}\"}]" /tmp/kustomize/kustomization.yaml
done

kustomize build /tmp/kustomize > /manifests/manifests.yaml
