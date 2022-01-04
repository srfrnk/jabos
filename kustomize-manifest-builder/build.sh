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
REPLACEMENT_STRINGS=$3
shift 3
IMAGES=$@

ROOT_PATH="/gitTemp/${SRC_PATH}"

cp -R ${ROOT_PATH} /tmp/kustomize

for file in $(find /tmp/kustomize -name '*.yaml' -o -name '*.yml' -o -name '*.json'); do
  outfile=$(realpath --relative-to /tmp/kustomize ${file} | xargs -I{} basename {})
  sed -i "${REPLACEMENT_STRINGS}" ${file}
done

for image in ${IMAGES}; do
  yq e -i ".images |= . + [{\"name\":\"${image}\",\"newTag\":\"${COMMIT}\"}]" /tmp/kustomize/kustomization.yaml
done

kustomize build /tmp/kustomize > /manifests/manifests.yaml
