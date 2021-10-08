#! /bin/sh

echo "Args: $@"

TYPE=$1
NAME=$2
NAMESPACE=$3
COMMIT=$4

APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
# NAMESPACE=$(cat ${SERVICEACCOUNT}/namespace)
TOKEN=$(cat ${SERVICEACCOUNT}/token)
CACERT=${SERVICEACCOUNT}/ca.crt

curl --fail-with-body --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api

curl --fail-with-body --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -H "Content-Type:application/json-patch+json" \
  -X PATCH ${APISERVER}/apis/jabos.io/v1/namespaces/${NAMESPACE}/${TYPE}/${NAME} \
  -d "[{\"op\": \"replace\", \"path\": \"/metadata/annotations/builtCommit\", \"value\":\"${COMMIT}\"}]"
