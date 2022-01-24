#! /bb/bin/sh

set -o pipefail
ERROR_MESSAGE=$(/kaniko/executor $@ 2>&1 | /bb/bin/tee /dev/tty)

if [ $? -ne 0 ]; then
  ERROR_MESSAGE=$(/bb/bin/echo "${ERROR_MESSAGE}" | /bb/bin/tr '\n' ' ' | /bb/bin/tail -c 1024)

  export APISERVER=https://kubernetes.default.svc
  SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
  export TOKEN=$(/bb/bin/cat ${SERVICEACCOUNT}/token)
  export CACERT=${SERVICEACCOUNT}/ca.crt

  /bb/tools/jsonnet -A "name=${NAME}" -A "namespace=${NAMESPACE}" -A "uid=${OBJECT_UID}" -A "errorMessage=${ERROR_MESSAGE}" -A "eventTime=$(/bb/bin/date -u +%Y-%m-%dT%H:%M:%S.000000Z)" \
    /bb/tools/error-event.jsonnet | /bb/tools/yq e -P "sort_keys(..)" - | /bb/tools/kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -n ${NAMESPACE} -f - >/dev/null

  /bb/bin/echo ${ERROR_MESSAGE} > /dev/termination-log

  /bb/bin/echo "Exiting"
  /bb/bin/sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
else
  /bb/bin/echo "Exiting"
  /bb/bin/sleep 10 # Just to allow fluentd gathering logs before termination
fi
