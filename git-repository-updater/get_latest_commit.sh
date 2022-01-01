#! /bin/bash

set -Ee

echo "Args: $@"

URL=$1
BRANCH=$2
NAMESPACE=$3
NAME=$4
OBJECT_UID=$5

function exit {
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

function error {
  curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterEnd" \
    -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","success":"false","latest_commit_update":"false"}' -H "Content-Type: application/json" >/dev/null

  ERROR_MESSAGE=$(echo ${ERROR_MESSAGE} | tr -d '\n')

  jsonnet -A "name=${NAME}" -A "namespace=${NAMESPACE}" -A "uid=${OBJECT_UID}" -A "errorMessage=${ERROR_MESSAGE}" -A "eventTime=$(date -u +%Y-%m-%dT%H:%M:%S.000000Z)" \
    error-event.jsonnet | yq e -P "sort_keys(..)" - | kc apply -n ${NAMESPACE} -f - >/dev/null

  echo ${ERROR_MESSAGE}
}

trap error ERR

START=$(date +%s)

source /kubectl-setup.sh

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterStart" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'"}' -H "Content-Type: application/json" >/dev/null

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)"
  echo "${SSH_PASSPHRASE}" | setsid ssh-add <(printf -- "${SSH_KEY}")
fi

rm -rf /gitTemp/*
ERROR_MESSAGE=$(git clone --bare --single-branch --depth 1 --branch ${BRANCH} ${URL} /gitTemp 2>&1)
cd  /gitTemp
LATEST_COMMIT=$(git log -n 1 --pretty=format:"%H" | head -n 1)

LATEST_COMMIT_UPDATE="false"
[[ $(kc annotate --overwrite -n ${NAMESPACE} git-repositories.jabos.io ${NAME} "latestCommit=${LATEST_COMMIT}") =~ " unchanged" ]] || LATEST_COMMIT_UPDATE="true"

END=$(date +%s)
DURATION=$(echo "$END - $START" | bc)

curl -s -X POST "${JABOS_OPERATOR_URL}setMetric/gitRepositoryUpdaterDuration?value=${DURATION}" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","latest_commit_update":"'"${LATEST_COMMIT_UPDATE}"'"}' -H "Content-Type: application/json" >/dev/null

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterEnd" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","success":"true","latest_commit_update":"'"${LATEST_COMMIT_UPDATE}"'"}' -H "Content-Type: application/json" >/dev/null

kc delete --ignore-not-found=true -n ${NAMESPACE} events.events.k8s.io ${NAME}-git-pull-error
