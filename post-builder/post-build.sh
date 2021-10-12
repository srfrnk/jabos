#! /bin/bash

set -e
trap "sleep 5" EXIT # Just to allow fluentd gathering logs before termination

echo "Args: $@"

TYPE=$1
NAME=$2
NAMESPACE=$3
COMMIT=$4

source /setup.sh

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  apply view-last-applied -n ${NAMESPACE} ${TYPE}.jabos.io ${NAME} > /tmp/current.yaml
echo "current:"
cat /tmp/current.yaml

yq e -P ".metadata.annotations.builtCommit=\"${COMMIT}\"" /tmp/current.yaml > /tmp/updated.yaml
echo ""
echo "updated:"
cat /tmp/updated.yaml

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -f /tmp/updated.yaml
