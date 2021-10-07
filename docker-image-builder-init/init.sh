#! /bin/sh

echo "Args: $@"

URL=$1
BRANCH=$2
DOCKER_CONFIG=$3

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp

echo -n "${DOCKER_CONFIG}" | base64 -d > /kaniko/.docker/config.json
cat /kaniko/.docker/config.json
