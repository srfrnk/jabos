#! /bin/sh

set -e

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3
DOCKER_CONFIG=$4

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}

echo -n "${DOCKER_CONFIG}" | base64 -d > /kaniko/.docker/config.json
cat /kaniko/.docker/config.json
