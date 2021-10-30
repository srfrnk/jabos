FORCE:

setup: FORCE
	minikube addons enable registry
	minikube addons enable registry-aliases
	kubectl apply -f manifests/minikube-registry.yaml
	- kubectl create --save-config namespace jabos
	- kubectl create --save-config namespace efk
	- kubectl create --save-config namespace example-env
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production
	kubectl apply -n efk -f https://github.com/srfrnk/efk-stack-helm/releases/latest/download/efk-manifests.yaml
	kubectl wait -n efk --for=condition=complete --timeout=600s job/initializer
	@tput bold
	@tput setaf 2
	@echo
	@echo "Now you can run: kubectl port-forward -n efk svc/efk-kibana 5601"
	@echo "Then you can view in browser: open http://localhost:5601/app/discover"
	@tput sgr0

build_number: FORCE
	$(eval BUILD_NUMBER=$(shell od -An -N10 -i /dev/urandom | tr -d ' -' ))

images: FORCE build_number
	docker build ./jsonnet -t jsonnet:latest
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./jsonnet -t jsonnet:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./kubectl -t kubectl:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./operator -t operator:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./git-repository-updater -t git-repository-updater:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./docker-image-builder-init -t docker-image-builder-init:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./jsonnet-manifest-builder -t jsonnet-manifest-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./post-builder -t post-builder:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build --build-arg "IMAGE_PREFIX=" --build-arg "IMAGE_VERSION=:${BUILD_NUMBER}" ./manifest-deployer -t manifest-deployer:${BUILD_NUMBER}

manifests: FORCE build_number
	- mkdir build
	docker run --mount "type=bind,src=$$(pwd)/manifests,dst=/src,readonly" jsonnet -- \
		--tla-str 'imagePrefix=' \
		--tla-str 'buildNumber=${BUILD_NUMBER}' \
		--tla-str 'namespace=jabos' \
		--tla-str 'debug=true' \
		> build/manifests.yaml

build: FORCE images manifests
	kubectl apply -n jabos -f build/manifests.yaml

deploy-examples: FORCE
	kubectl apply -f https://raw.githubusercontent.com/srfrnk/jabos-examples/main/simple-build.yaml

	- rm -rf ./build/tmp
	git clone --single-branch --branch main -- https://github.com/srfrnk/jabos-examples-private.git ./build/tmp
	kubectl apply -f ./build/tmp/simple-build.yaml
	rm -rf ./build/tmp
