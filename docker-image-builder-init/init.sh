#! /bin/sh

echo "Args: $@"

URL=$1
BRANCH=$2

git clone --single-branch --branch ${BRANCH} -- ${URL} /gitTemp

ls /gitTemp
