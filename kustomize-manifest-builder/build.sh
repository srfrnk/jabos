#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

ROOT_PATH="/gitTemp/${SRC_PATH}"

cp -R ${ROOT_PATH} /tmp/kustomize

for file in $(find /tmp/kustomize -name '*.yaml' -o -name '*.yml' -o -name '*.json'); do
  outfile=$(realpath --relative-to /tmp/kustomize ${file} | xargs -I{} basename {})
  sed -i "${REPLACEMENT_STRINGS}" ${file}
done

yq e -i ".images |= . + ${IMAGES}" /tmp/kustomize/kustomization.yaml

kustomize build /tmp/kustomize > /manifests/manifests.yaml
