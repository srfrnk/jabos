#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

source /kubectl-setup.sh

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  apply view-last-applied -n ${NAMESPACE} ${TYPE}.jabos.io ${NAME} > /tmp/current.yaml
yq e -P ".metadata.annotations.builtCommit=\"${COMMIT}\"" /tmp/current.yaml > /tmp/updated.yaml
kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -f /tmp/updated.yaml

START=$(cat /timer/start)
END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)

END_METRIC_LABELS=$(echo ''"${METRIC_LABELS}"'' | yq e -o=json -I=0 ".success=\"true\"" -)

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}End" \
  -d ''"${END_METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null

curl -s -X POST "${JABOS_OPERATOR_URL}setMetric/${METRIC_NAME}Duration?value=${DURATION}" \
  -d ''"${METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null
