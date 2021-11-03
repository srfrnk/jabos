#!/bin/bash

set -Ee

ARGS="$@"

for file in /src/*.jsonnet; do
  jsonnet ${file} ${ARGS} > /build/$(basename $file .jsonnet).json;
done

yq e -I 2 -P '(. | select(has(0))| .[] | splitDoc) // .' /build/*.json
