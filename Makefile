FORCE:

setup: FORCE
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production
	- kubectl create namespace efk
	kubectl apply -n efk -f https://github.com/srfrnk/efk-stack-helm/releases/download/1.0.4/efk-manifests-1.0.4.yaml
	kubectl wait --for=condition=Ready -n efk pod -l app=kibana
	- kubectl exec -n efk deployment/efk-kibana -- curl --retry 10 -f -XPOST -H "Content-Type: application/json" -H "kbn-xsrf: anything" "http://localhost:5601/api/saved_objects/index-pattern/logstash-*" \
			-d "{\"attributes\":{\"title\":\"logstash-*\",\"timeFieldName\":\"@timestamp\"}}"
	- kubectl create namespace jabos

build_number: FORCE
	$(eval BUILD_NUMBER=$(shell od -An -N10 -i /dev/urandom | tr -d ' -'))

images: FORCE build_number
	docker build ./jsonnet -t jsonnet:latest
	eval $$(minikube docker-env) && docker build ./jsonnet -t jsonnet:${BUILD_NUMBER}
	eval $$(minikube docker-env) && docker build ./operator -t operator:${BUILD_NUMBER}

manifests: FORCE build_number
	- mkdir build
	docker run --mount "type=bind,src=$$(pwd)/manifests,dst=/src,readonly" jsonnet -- --tla-str 'imagePrefix=' --tla-str 'buildNumber=${BUILD_NUMBER}' > build/manifests.yaml

build: FORCE images manifests
	kubectl apply -n jabos -f build/manifests.yaml
