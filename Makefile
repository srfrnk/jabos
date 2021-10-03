FORCE:

setup: FORCE
	- kubectl create namespace jabos
	- kubectl create namespace efk
	- kubectl create namespace trow
	- helm repo add trow https://trow.io
	- helm install -n trow --set-string trow.domain=trow.trow trow trow/trow
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production
	kubectl apply -n efk -f https://github.com/srfrnk/efk-stack-helm/releases/download/1.0.16/efk-manifests-1.0.16.yaml
	kubectl wait -n efk --for=condition=complete --timeout=300s job/initializer
	@tput bold
	@echo
	@echo "Now you can run: kubectl port-forward -n efk svc/efk-kibana 5601"
	@echo "Then you can view in browser: open http://localhost:5601/app/discover"
	@tput sgr0

build_number: FORCE
	$(eval BUILD_NUMBER=$(shell od -An -N10 -i /dev/urandom | tr -d ' -' ))

images: FORCE build_number
	docker build ./jsonnet -t jsonnet:latest
	eval $$(minikube docker-env) && docker build ./jsonnet -t jsonnet:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./operator -t operator:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./docker-image-builder-init -t docker-image-builder-init:${BUILD_NUMBER}

manifests: FORCE build_number
	- mkdir build
	docker run --mount "type=bind,src=$$(pwd)/manifests,dst=/src,readonly" jsonnet -- \
		--tla-str 'imagePrefix=' \
		--tla-str 'buildNumber=${BUILD_NUMBER}' \
		--tla-str 'namespace=jabos' \
		> build/manifests.yaml

build: FORCE images manifests
	kubectl apply -n jabos -f build/manifests.yaml
