#! /bin/bash

set -e

echo "Args: $@"

NAMESPACE=$1

APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
TOKEN=$(cat ${SERVICEACCOUNT}/token)
CACERT=${SERVICEACCOUNT}/ca.crt

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  -n ${NAMESPACE} apply -f /manifests/manifests.yaml

sleep 5 # Just to allow fluentd gathering logs before termination
