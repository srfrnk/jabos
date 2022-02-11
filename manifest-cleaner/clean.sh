#! /bin/bash

source /kubectl-setup.sh

cat /manifests/manifests.tar.gz.b64 | sed 's/:/\n/g' | base64 -d | tar -xzO | tee /tmp/manifests.yaml >/dev/null

set -o pipefail
ERROR_MESSAGE=$(kc -n ${NAMESPACE} delete -f /tmp/manifests.yaml 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  ERROR_MESSAGE=$(echo "${ERROR_MESSAGE}" | tr '\n' ' ' | tail -c 1024)

  jsonnet -A "kind=${KIND}" -A "controller=${CONTROLLER}" -A "name=${NAME}" -A "namespace=${NAMESPACE}" -A "uid=${OBJECT_UID}" -A "errorMessage=${ERROR_MESSAGE}" -A "eventTime=$(date -u +%Y-%m-%dT%H:%M:%S.000000Z)" \
    /error-event.jsonnet | yq e -P "sort_keys(..)" - | kc apply -n ${NAMESPACE} -f - >/dev/null

  echo ${ERROR_MESSAGE} > /dev/termination-log

  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
else
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
fi
