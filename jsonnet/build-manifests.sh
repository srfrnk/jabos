#!/bin/bash

for file in /src/*.jsonnet; do
  jsonnet ${file} > /build/$(basename $file .jsonnet).json;
done

yq ea -I 2 -P "." /build/*.json
