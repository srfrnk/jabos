#! /bin/bash

ROOT_PATH="/gitTemp/${SRC_PATH}"

cp -R ${ROOT_PATH} /tmp/kustomize

for file in $(find /tmp/kustomize -name '*.yaml' -o -name '*.yml' -o -name '*.json'); do
  outfile=$(realpath --relative-to /tmp/kustomize ${file} | xargs -I{} basename {})

  set -o pipefail
  ERROR_MESSAGE=$(sed -i "${REPLACEMENT_STRINGS}" ${file} 2>&1 | tee /dev/tty)

  if [ $? -ne 0 ]; then
    source exit-error.sh
    echo "Exiting"
    sleep 10 # Just to allow fluentd gathering logs before termination
    exit 1
  fi
done

yq e -i ".images |= . + ${IMAGES}" /tmp/kustomize/kustomization.yaml

set -o pipefail
ERROR_MESSAGE=$(bash -c "kustomize build /tmp/kustomize > /manifests/manifests.yaml" 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  source exit-error.sh
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
else
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
fi
