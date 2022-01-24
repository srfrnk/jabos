#! /bin/bash

source /kubectl-setup.sh

ERROR_MESSAGE=$(echo "${ERROR_MESSAGE}" | tr '\n' ' ' | tail -c 1024)

jsonnet -A "kind=${KIND}" -A "controller=${CONTROLLER}" -A "name=${NAME}" -A "namespace=${NAMESPACE}" -A "uid=${OBJECT_UID}" -A "errorMessage=${ERROR_MESSAGE}" -A "eventTime=$(date -u +%Y-%m-%dT%H:%M:%S.000000Z)" \
  /error-event.jsonnet | yq e -P "sort_keys(..)" - | kc apply -n ${NAMESPACE} -f - >/dev/null

echo ${ERROR_MESSAGE} > /dev/termination-log
