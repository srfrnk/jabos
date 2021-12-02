#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

NAMESPACE=$1

source /kubectl-setup.sh

cat /manifests/manifests.tar.gz.b64 | base64 -d | tar -xzO | tee /tmp/manifests.yaml >/dev/null

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  -n ${NAMESPACE} delete -f /tmp/manifests.yaml
