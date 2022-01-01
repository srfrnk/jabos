#! /bin/bash

set -Ee

function exit {
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

export APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
export TOKEN=$(cat ${SERVICEACCOUNT}/token)
export CACERT=${SERVICEACCOUNT}/ca.crt

kc()
{
  kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} $@
}
export -f kc

kc version
