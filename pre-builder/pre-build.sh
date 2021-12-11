#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3
METRIC_NAME=$4
METRIC_LABLES=$5

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}Start" \
  -d ''"${METRIC_LABLES}"'' -H "Content-Type: application/json" >/dev/null

date +%s.%N > /timer/start

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)"
  echo "${SSH_PASSPHRASE}" | setsid ssh-add <(printf -- "${SSH_KEY}")
fi

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}
