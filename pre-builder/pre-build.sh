#! /bin/bash

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}Start" \
  -d ''"${METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null

date +%s.%N > /timer/start

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)"
  echo "${SSH_PASSPHRASE}" | setsid ssh-add <(printf -- "${SSH_KEY}")
fi

if [ -n "${BRANCH}" ]; then
  BRANCH_ARG="--branch ${BRANCH}"
fi

git clone --single-branch ${BRANCH_ARG} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}


echo "Exiting"
sleep 10 # Just to allow fluentd gathering logs before termination
