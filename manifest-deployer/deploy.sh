#! /bin/bash

source /kubectl-setup.sh

set -o pipefail
ERROR_MESSAGE=$(kc -n ${TARGET_NAMESPACE} apply -f /manifests/manifests.yaml 2>&1 | tee /dev/tty)

if [ $? -ne 0 ]; then
  ERROR_MESSAGE=$(echo "${ERROR_MESSAGE}" | tr '\n' ' ' | tail -c 1024)

  jsonnet -A "kind=${KIND}" -A "controller=${CONTROLLER}" -A "name=${NAME}" -A "namespace=${NAMESPACE}" -A "uid=${OBJECT_UID}" -A "errorMessage=${ERROR_MESSAGE}" -A "eventTime=$(date -u +%Y-%m-%dT%H:%M:%S.000000Z)" \
    /error-event.jsonnet | yq e -P "sort_keys(..)" - | kc apply -n ${NAMESPACE} -f - >/dev/null

  echo ${ERROR_MESSAGE} > /dev/termination-log

  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
  exit 1
else
  kc annotate --overwrite -n ${NAMESPACE} ${TYPE}.jabos.io ${NAME} "deployedManifest=$(tar -czf - /manifests/manifests.yaml | base64 | sed -z 's/\n/:/g')"

  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
fi
