#! /bin/bash

set -Ee

function exit {
  echo "Exiting"
  sleep 10 # Just to allow fluentd gathering logs before termination
}

trap exit EXIT

echo "Args: $@"

TYPE=$1
NAME=$2
NAMESPACE=$3
COMMIT=$4
METRIC_NAME=$5
METRIC_LABLES=$6

source /kubectl-setup.sh

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  apply view-last-applied -n ${NAMESPACE} ${TYPE}.jabos.io ${NAME} > /tmp/current.yaml
yq e -P ".metadata.annotations.builtCommit=\"${COMMIT}\"" /tmp/current.yaml > /tmp/updated.yaml
kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -f /tmp/updated.yaml

START=$(cat /timer/start)
END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)

END_METRIC_LABLES=$(echo ''"${METRIC_LABLES}"'' | yq e -o=json -I=0 ".success=\"true\"" -)

curl -s -X POST "${JABOS_OPERATOR_URL}addMetric/${METRIC_NAME}End" \
  -d ''"${END_METRIC_LABLES}"'' -H "Content-Type: application/json" >/dev/null

curl -s -X POST "${JABOS_OPERATOR_URL}setMetric/${METRIC_NAME}Duration?value=${DURATION}" \
  -d ''"${METRIC_LABLES}"'' -H "Content-Type: application/json" >/dev/null
