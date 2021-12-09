#! /bin/bash

set -Ee

echo "Args: $@"

URL=$1
BRANCH=$2
NAMESPACE=$3
NAME=$4

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

function error {
  echo "Error"
  curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterEnd" \
    -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","success":"false","latest_commit_update":"false"}' -H "Content-Type: application/json" >/dev/null
}

trap error ERR

START=$(date +%s.%N)

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterStart" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'"}' -H "Content-Type: application/json" >/dev/null

source /kubectl-setup.sh

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)" >&2
  echo "${SSH_PASSPHRASE}" | setsid ssh-add <(printf -- "${SSH_KEY}") >&2
fi

git clone --bare --single-branch --depth 1 --branch ${BRANCH} ${URL} /gitTemp

cd  /gitTemp
LATEST_COMMIT=$(git log -n 1 --pretty=format:"%H" | head -n 1)

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  apply view-last-applied -n ${NAMESPACE} git-repositories.jabos.io ${NAME} > /tmp/current.yaml
yq e -P ".metadata.annotations.latestCommit=\"${LATEST_COMMIT}\"" /tmp/current.yaml > /tmp/updated.yaml

LATEST_COMMIT_UPDATE="false"
[[ $(kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -f /tmp/updated.yaml) =~ " unchanged" ]] || LATEST_COMMIT_UPDATE="true"

END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)

curl -s -X POST "${JABOS_OPERATOR_URL}setMetric/gitRepositoryUpdaterDuration?value=${DURATION}" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","latest_commit_update":"'"${LATEST_COMMIT_UPDATE}"'"}' -H "Content-Type: application/json" >/dev/null

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/gitRepositoryUpdaterEnd" \
  -d '{"namespace":"'"${NAMESPACE}"'","git_repository":"'"${NAME}"'","success":"true","latest_commit_update":"'"${LATEST_COMMIT_UPDATE}"'"}' -H "Content-Type: application/json" >/dev/null
