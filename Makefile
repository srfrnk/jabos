FORCE:

setup: SHELL:=/bin/bash
setup: FORCE
	minikube addons enable registry
	minikube addons enable registry-aliases
	kubectl apply -f minikube-registry.yaml
	- kubectl create --save-config namespace jabos
	- kubectl create --save-config namespace efk
	- kubectl create --save-config namespace example-env
	- kubectl create --save-config namespace example-env-stg
	- kubectl create --save-config namespace monitoring
	- kubectl create --save-config namespace grafana-dashboard-operator
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production
	kubectl apply -n efk -f https://github.com/srfrnk/efk-stack-helm/releases/latest/download/efk-manifests.yaml
	- helm upgrade -i --wait -n monitoring kube-prometheus-stack kube-prometheus-stack --repo https://prometheus-community.github.io/helm-charts \
		--set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.probeSelectorNilUsesHelmValues=false \
		--set kube-state-metrics.podSecurityPolicy.enabled=false \
		--set prometheus-node-exporter.rbac.pspEnabled=false \
		--set grafana.rbac.pspEnabled=false \
		--set global.rbac.pspEnabled=false
	kubectl apply -n grafana-dashboard-operator -f https://github.com/srfrnk/grafana-dashboard-operator/releases/latest/download/grafana-dashboard-operator-manifests.yaml
	- kubectl delete secret -n grafana-dashboard-operator grafana-api
	TOKEN="null"; \
		while [ "$${TOKEN}" = "null" ]; do \
			TOKEN=$$(echo "curl -X POST -H \"Content-Type: application/json\" -d '{\"name\":\"apikey$${RANDOM}\", \"role\": \"Admin\"}' \
			http://admin:prom-operator@kube-prometheus-stack-grafana/api/auth/keys 2>/dev/null ; echo" \
			| kubectl run -i --rm -n monitoring --image curlimages/curl curl$${RANDOM} -- sh 2>/dev/null \
			| grep -v -e "pod .* deleted" | yq eval '.key' -); \
		done; \
		kubectl -n grafana-dashboard-operator create secret generic grafana-api --from-literal=token=$${TOKEN}
	kubectl wait -n efk --for=condition=complete --timeout=600s job/initializer
	@kubectl patch -n efk deployments.apps efk-kibana --patch-file efk-k9s-pf.yaml
	@kubectl patch -n monitoring deployments.apps kube-prometheus-stack-grafana --patch-file grafana-k9s-pf.yaml
	@kubectl patch -n kube-system replicationcontrollers registry --patch-file registry-k9s-pf.yaml
	@kubectl delete pod -n kube-system -l kubernetes.io/minikube-addons=registry -l actual-registry=true
	@tput bold
	@tput setaf 2
	@echo
	@echo "You can make you sure your K9s configuration (~/.config/k9s/config.yml) has 'scanForAutoPf: true' and then run 'k9s' to provide port-forwarding."
	@echo "You can view Kibana in your browser by going to http://localhost:5601/app/discover"
	@echo "You can view Grafana in your browser by going to http://localhost:3000 (User:'admin' Password:'prom-operator')"
	@echo
	@tput sgr0

build_number: FORCE
	$(eval BUILD_NUMBER=$(shell od -An -N10 -i /dev/urandom | tr -d ' -' ))

images: FORCE build_number
	- mkdir -p ./operator/imports
	cp ./manifests/dist/jabos.k8s.yaml ./operator/imports
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./kubectl -t kubectl:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./operator -t operator:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./docker-image-builder-init -t docker-image-builder-init:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./pre-builder -t pre-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./base-manifest-builder -t base-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./kaniko -t kaniko:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./git-repository-updater -t git-repository-updater:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./post-builder -t post-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./manifest-deployer -t manifest-deployer:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./manifest-cleaner -t manifest-cleaner:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./jsonnet-manifest-builder -t jsonnet-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./plain-manifest-builder -t plain-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./helm-template-manifest-builder -t helm-template-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./kustomize-manifest-builder -t kustomize-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./cdk8s-manifest-builder -t cdk8s-manifest-builder:${BUILD_NUMBER}

manifests: FORCE build_number
	cd manifests && npm i
	docker run -it --mount "type=bind,src=$$PWD/manifests,dst=/src" --entrypoint sh -w /src \
		-e 'IMAGE_PREFIX=' \
		-e 'BUILD_NUMBER=${BUILD_NUMBER}' \
		-e 'NAMESPACE=jabos' \
		-e 'IS_PRODUCTION=false' \
	node:lts-alpine -c "npm run import && npm run compile && npm run test && npm run synth"

snyk-scan: FORCE manifests build_number
	docker run -it -e SNYK_TOKEN=${SNYK_TOKEN} -v $$PWD/manifests/dist:/project snyk/snyk-cli:docker iac test /project/jabos.k8s.yaml

compile:
	- mkdir -p ./operator/imports
	cp ./manifests/dist/jabos.k8s.yaml ./operator/imports
	cd operator && npm i && npm run compile && npm run test

build: FORCE manifests compile images
	kubectl apply -n jabos -f ./manifests/dist/jabos.k8s.yaml

deploy-examples: FORCE
	docker pull node:lts-alpine
	docker tag node:lts-alpine localhost:5555/node:lts-alpine
	docker push localhost:5555/node:lts-alpine

	make -C ../jabos-examples set-secret
	make -C ../jabos-examples-private set-secret
	make -C ../jabos-examples-gitlab set-secret

	kubectl apply -f ../jabos-examples/simple-build.yaml
	kubectl apply -f ../jabos-examples/failed-builds.yaml
	kubectl apply -f ../jabos-examples-private/simple-build.yaml
	kubectl apply -f ../jabos-examples-gitlab/simple-build.yaml

un-deploy-examples: FORCE
	- kubectl delete -f ../jabos-examples/simple-build.yaml
	- kubectl delete -f ../jabos-examples/failed-builds.yaml
	- kubectl delete -f ../jabos-examples-private/simple-build.yaml
	- kubectl delete -f ../jabos-examples-gitlab/simple-build.yaml

build-docs: FORCE manifests
	docker run --mount "type=bind,src=$$PWD,dst=/data" \
		ghcr.io/srfrnk/crd-api-doc-gen:latest /data/build /data/build/api-docs /data/api-info.yaml

status-check-examples:
	@echo "GitRepository:"
	- @kubectl get --all-namespaces git-repositories.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Syncing')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "DockerImage:"
	- @kubectl get --all-namespaces docker-images.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "JsonnetManifest:"
	- @kubectl get --all-namespaces jsonnet-manifests.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "HelmTemplateManifest:"
	- @kubectl get --all-namespaces helm-template-manifests.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "KustomizeManifest:"
	- @kubectl get --all-namespaces kustomize-manifests.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "PlainManifest:"
	- @kubectl get --all-namespaces plain-manifests.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
	@echo ""
	@echo "Cdk8sManifest:"
	- @kubectl get --all-namespaces cdk8s-manifests.jabos.io -ojsonpath="{range .items[*]}{.metadata.namespace}{':'}{.metadata.name}{'\t'}{.status.conditions[?(@.type=='Synced')].status}{'\n'}{end}" | GREP_COLOR="1;32" grep --color=always -E "True|$$" | GREP_COLOR="1;31" grep --color=always -E "False|$$"
