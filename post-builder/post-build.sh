#! /bin/bash

source /kubectl-setup.sh

kcurl PATCH "/apis/jabos.io/v1/namespaces/${NAMESPACE}/${TYPE}/${NAME}/status" "application/merge-patch+json" \
  "$(jsonnet -A "builtCommit=${COMMIT}" /status.jsonnet)" >/dev/null

START=$(cat /timer/start)
END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)

END_METRIC_LABELS=$(echo ''"${METRIC_LABELS}"'' | yq e -o=json -I=0 ".success=\"true\"" -)

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}End" \
  -d ''"${END_METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null

curl -s -X POST "${JABOS_OPERATOR_URL}setMetric/${METRIC_NAME}Duration?value=${DURATION}" \
  -d ''"${METRIC_LABELS}"'' -H "Content-Type: application/json" >/dev/null

echo "Exiting"
sleep 10 # Just to allow fluentd gathering logs before termination
