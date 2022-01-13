#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}Start" \
  -d ''"${METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null

date +%s.%N > /timer/start

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)"
  echo "${SSH_PASSPHRASE}" | setsid ssh-add <(printf -- "${SSH_KEY}")
fi

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}
