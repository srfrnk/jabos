local-setup:
	kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production

build-images:
	docker build ./jsonnet -t jsonnet:latest

build-manifests:
	- mkdir build
	docker run --mount "type=bind,src=$$(pwd)/manifests,dst=/src,readonly" jsonnet > build/manifests.yaml
