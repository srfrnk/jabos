#! /bin/bash

set -e

echo "Args: $@"

URL=$1
BRANCH=$2
NAMESPACE=$3
NAME=$4

source /kubectl-setup.sh

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)" >&2
  echo "${SSH_PASSPHRASE}" | setsid -w ssh-add <(printf -- "${SSH_KEY}") >&2
fi

git clone --bare --single-branch --depth 1 --branch ${BRANCH} ${URL} /gitTemp

cd  /gitTemp
LATEST_COMMIT=$(git log -n 1 --pretty=format:"%H" | head -n 1)

kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} \
  apply view-last-applied -n ${NAMESPACE} git-repositories.jabos.io ${NAME} > /tmp/current.yaml
yq e -P ".metadata.annotations.latestCommit=\"${LATEST_COMMIT}\"" /tmp/current.yaml > /tmp/updated.yaml
kubectl --server=${APISERVER} --token=${TOKEN} --certificate-authority=${CACERT} apply -f /tmp/updated.yaml

sleep 5 # Just to allow fluentd gathering logs before termination
