IMAGE_REPOSITORY="ghcr.io/srfrnk/"

test:
	echo "From makefile"

local-setup: build-images

build-images:
	docker build ./jsonnet -t ${IMAGE_REPOSITORY}jsonnet:latest
