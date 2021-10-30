#! /bin/bash

set -e

echo "Args: $@"

NAMESPACE=$1

source /kubectl-setup.sh

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  -n ${NAMESPACE} apply -f /manifests/manifests.yaml

sleep 5 # Just to allow fluentd gathering logs before termination
