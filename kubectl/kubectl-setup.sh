#! /bin/bash

export APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
export TOKEN=$(cat ${SERVICEACCOUNT}/token)
export CACERT=${SERVICEACCOUNT}/ca.crt

kc()
{
  kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} $@
}
export -f kc

kcurl()
{
  VERB=$1
  API_PATH=$2
  CONTENT_TYPE=$3
  CONTENT=$4
  curl -X ${VERB} -H "Authorization: Bearer ${TOKEN}" --cacert ${CACERT} -H "Content-Type: ${CONTENT_TYPE}" "${APISERVER}${API_PATH}" -d "${CONTENT}"
}
export -f kc

kc version
