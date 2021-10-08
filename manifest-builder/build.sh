#! /bin/sh

echo "Args: $@"

URL=$1
BRANCH=$2
COMMIT=$3

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp
cd /gitTemp
git checkout ${COMMIT}
