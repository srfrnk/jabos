FORCE:

setup: SHELL:=/bin/bash
setup: FORCE
	minikube addons enable registry
	minikube addons enable registry-aliases
	kubectl apply -f manifests/minikube-registry.yaml
	- kubectl create --save-config namespace jabos
	- kubectl create --save-config namespace efk
	- kubectl create --save-config namespace example-env
	- kubectl create --save-config namespace monitoring
	- kubectl create --save-config namespace grafana-dashboard-operator
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production
	kubectl apply -n efk -f https://github.com/srfrnk/efk-stack-helm/releases/latest/download/efk-manifests.yaml
	- helm upgrade -i --wait -n monitoring kube-prometheus-stack kube-prometheus-stack --repo https://prometheus-community.github.io/helm-charts \
		--set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
		--set prometheus.prometheusSpec.probeSelectorNilUsesHelmValues=false
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
	@tput bold
	@tput setaf 2
	@echo
	@echo "You can view Kibana in your browser by going to http://localhost:5601/app/discover"
	@echo "You can view Grafana in your browser by going to http://localhost:3000 (User:'admin' Password:'prom-operator')"
	@echo
	@tput sgr0
	make service-port-forward

build_number: FORCE
	$(eval BUILD_NUMBER=$(shell od -An -N10 -i /dev/urandom | tr -d ' -' ))

images: FORCE build_number
	eval $$(minikube docker-env) && docker build ./kubectl -t kubectl:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./operator -t operator:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./docker-image-builder-init -t docker-image-builder-init:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./pre-builder -t pre-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./base-manifest-builder -t base-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./git-repository-updater -t git-repository-updater:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./post-builder -t post-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./manifest-deployer -t manifest-deployer:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./manifest-cleaner -t manifest-cleaner:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./jsonnet-manifest-builder -t jsonnet-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./plain-manifest-builder -t plain-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./helm-template-manifest-builder -t helm-template-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./kustomize-manifest-builder -t kustomize-manifest-builder:${BUILD_NUMBER}

manifests: FORCE build_number
	- mkdir build
	docker run --mount "type=bind,src=$$(pwd)/manifests,dst=/src" ghcr.io/srfrnk/k8s-jsonnet-manifest-packager:latest -- /src \
		--tla-str 'imagePrefix=' \
		--tla-str 'buildNumber=${BUILD_NUMBER}' \
		--tla-str 'namespace=jabos' \
		--tla-str 'debug=true' \
		> build/manifests.yaml

build: FORCE images manifests
	kubectl apply -n jabos -f build/manifests.yaml

deploy-examples: FORCE
	make -C ../jabos-examples set-secret
	make -C ../jabos-examples-private set-secret
	make -C ../jabos-examples-gitlab set-secret

	kubectl apply -f ../jabos-examples/simple-build.yaml
	kubectl apply -f ../jabos-examples-private/simple-build.yaml
	kubectl apply -f ../jabos-examples-gitlab/simple-build.yaml

un-deploy-examples: FORCE
	kubectl delete -f ../jabos-examples/simple-build.yaml
	kubectl delete -f ../jabos-examples-private/simple-build.yaml
	kubectl delete -f ../jabos-examples-gitlab/simple-build.yaml

service-port-forward: FORCE
	parallel --linebuffer -j0 eval kubectl port-forward -n {} ::: "efk svc/efk-kibana 5601" "monitoring svc/kube-prometheus-stack-grafana 3000:80"

build-docs: FORCE manifests
	docker run --mount "type=bind,src=$$PWD,dst=/data" \
		ghcr.io/srfrnk/crd-api-doc-gen:latest /data/build /data/build/api-docs /data/api-info.yaml
