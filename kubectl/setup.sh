#! /bin/bash

set -e
trap "sleep 5" EXIT # Just to allow fluentd gathering logs before termination

export APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
export TOKEN=$(cat ${SERVICEACCOUNT}/token)
export CACERT=${SERVICEACCOUNT}/ca.crt

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} version
