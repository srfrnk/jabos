#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

NAMESPACE=$1
TYPE=$2
NAME=$3

source /kubectl-setup.sh

tar -czf - /manifests/manifests.yaml | base64 | tee /tmp/manifests.tar.gz.b64 >/dev/null

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  -n ${NAMESPACE} apply -f /manifests/manifests.yaml

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  annotate --overwrite -n ${NAMESPACE} ${TYPE}.jabos.io ${NAME} "deployedManifest=$(cat /tmp/manifests.tar.gz.b64)"
