#!/bin/bash

set -e

ARGS="$@"
for file in /src/*.jsonnet; do
  jsonnet ${file} ${ARGS}> /build/$(basename $file .jsonnet).json;
done

yq ea -I 2 -P "." /build/*.json
