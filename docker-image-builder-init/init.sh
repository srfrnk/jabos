#! /bin/bash

set -e

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3
DOCKER_CONFIG=$4

if [ -n "${SSH_KEY}" ]; then
  eval "$(ssh-agent -s)" >&2
  echo "${SSH_PASSPHRASE}" | setsid -w ssh-add <(printf -- "${SSH_KEY}") >&2
fi

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}

echo -n "${DOCKER_CONFIG}" | base64 -d > /kaniko/.docker/config.json

sleep 5 # Just to allow fluentd gathering logs before termination
