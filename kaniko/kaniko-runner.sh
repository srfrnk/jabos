#! /bb/bin/sh

echo "Starting"

--build-arg http_proxy=${http_proxy} --build-arg https_proxy=${https_proxy} --build-arg no_proxy=${no_proxy}

/kaniko/executor --context=dir:///src --dockerfile=Dockerfile --destination=registry.kube-system:80/target \
  --insecure --skip-tls-verify --skip-tls-verify-pull --insecure-pull \
  --registry-mirror http://docker-registry-mirror.default:32000
/bb/bin/sleep 10

echo "Existing"
