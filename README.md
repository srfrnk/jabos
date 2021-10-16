# jabos

**Just Another Boring Ops System**
Jabos attempts to be a fully automated K8s GitOps framework.

## Goals

- Automate all steps to deploy from Git repositories into a K8s cluster
- No GUI requiring manual human intervention
- Git as a single source of truth
- Pull only model from within runtime environments.
- Isolation of build environment from runtime environment
- Idempotent builds
- Preview environment + Pre-deploy integration testing

## Guidelines

- Minimal set of tools/technologies as pre-requisites/installs
- Stay as tech-stack agnostic as possible
- Minimal steps to install or setup development environment. Automated as possible.

## Installation

1. Make sure Metacontroller is installed on your cluster. Find instructions [here](https://metacontroller.github.io/metacontroller/guide/install.html)
1. Create a namespace for jabos to use. E.g. `kubectl create namespace jabos`. Use the same namespace with the next command.
1. Run `kubectl apply -n <NAMESPACE> -f https://github.com/srfrnk/jabos/releases/latest/download/jabos-manifests.yaml`

## Usage

Jabos uses [CRDs](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) in order for users to define a codebase and how to build and deploy that.

### GitRepository

`GitRepository` objects define a git codebase and how to pull from it.

#### `GitRepository` Properties

- `apiVersion`: Must be "jabos.io/v1"
- `kind`: Must be "GitRepository"
- `metadata`
  - `name`: Name for the object (As with any K8s object)
  - `namespace`: Namespace for the object (As with any K8s object)
- `spec`
  - `url`: The URL to use to access the git repository.
  - `branch`: The name of the branch to watch and pull from.

E.g.:

```yaml
apiVersion: jabos.io/v1
kind: GitRepository
metadata:
  name: first-repo
  namespace: example-env
spec:
  url: https://github.com/srfrnk/jabos-examples.git
  branch: main
```

### DockerImage

`DockerImage` objects define images, how to build and push them.

#### `DockerImage` Properties

- `apiVersion`: Must be "jabos.io/v1"
- `kind`: Must be "DockerImage"
- `metadata`
  - `name`: Name for the object (As with any K8s object)
  - `namespace`: Namespace for the object (As with any K8s object)
- `spec`
  - `gitRepository`: The name of a `GitRepository` object which defines the codebase for the image. **Must be in the same namespace**.
  - `contextPath`: The path **relative to the git repository root** where the context for the docker build is found. Default: "." (Repository root)
  - `dockerFile`: The name of the Dockerfile to use for the docker build. Default: "Dockerfile"
  - `imageName`: The full image name excluding the tag part. Usually this will be prefixed with the registry address (e.g. `registry.kube-system:80/example-image`)
  - `insecureRegistry`: "True" to use insecure registries with docker push. Default: False
  - `dockerConfig`: Optional docker config yaml file to use. This allows configuring `Kaniko` access to external registries if required.

E.g.:

```yaml
apiVersion: jabos.io/v1
kind: DockerImage
metadata:
  name: first-image
  namespace: example-env
spec:
  gitRepository: first-repo
  contextPath: simple-runtime/images
  imageName: registry.kube-system:80/example-image
```

### JsonnetManifest

`JsonnetManifest` objects define a folder with [jsonnet](https://jsonnet.org/) based manifests to deploy.

#### `JsonnetManifest` Properties

- `apiVersion`: Must be "jabos.io/v1"
- `kind`: Must be "JsonnetManifest"
- `metadata`
  - `name`: Name for the object (As with any K8s object)
  - `namespace`: Namespace for the object (As with any K8s object)
- `spec`
  - `gitRepository`: The name of a `GitRepository` object which defines the codebase for the manifests. **Must be in the same namespace**.
  - `path`: The folder path **relative to the git repository root** where the jsonnet manifests are found. Default: "." (Repository root)
  - `commitTLAKey`: The name of a [Top-Level Argument (TLA)](https://jsonnet.org/ref/language.html#top-level-arguments-tlas) to use for injecting the latest git commit hash. The commit hash is used to tag generated images for example. See usage example below. Default: "latestCommitHash"
  - `targetNamespace`: The namespace into which deployment should be made. **Important Note: Due to a limitation with [Metacontroller](https://github.com/metacontroller/metacontroller) this has to be the same namespace as this object is put into.**

E.g.:

```yaml
apiVersion: jabos.io/v1
kind: JsonnetManifest
metadata:
  name: simple-jsonnet-manifest
  namespace: example-env
spec:
  gitRepository: first-repo
  path: simple-runtime/manifests
  targetNamespace: example-env
  commitTLAKey: latestCommitId
```

`example.jsonnet`:

```jsonnet
function(latestCommitId) {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'test-deployment',
    labels: {
      app: 'test-deployment',
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: 'test-deployment',
      },
    },
    template: {
      metadata: {
        labels: {
          app: 'test-deployment',
        },
      },
      spec: {
        containers: [
          {
            name: 'test-deployment',
            image: 'registry.kube-system:80/example-image:' + latestCommitId,
          },
        ],
      },
    },
  },
}

```

## Development

### Prerequisites

1. `make` installed (Depending on your OS - start [here](https://www.gnu.org/software/make/))
1. `docker` installed (To install wee [here](https://www.docker.com/get-started))
1. `minikube` installed (To install minikube see [this](https://minikube.sigs.k8s.io/docs/start/))
1. `NodeJS` installed (To install NodeJS see [this](https://nodejs.org))
1. `Typescript` development tools installed `npm install -g ts-node typescript '@types/node'`

### Environment Setup

1. Clone repo: `git clone git@github.com:srfrnk/jabos.git` (or using HTTPS/GitHub CLI - see instructions [here](https://github.com/srfrnk/jabos))
1. CD into folder
1. Start a minikube cluster `minikube start`
1. Run `make setup` once
1. Run `make build` after each code change
1. Run terminal with `kubectl port-forward -n efk svc/efk-kibana 5601` then open [kibana](http://localhost:5601/app/discover)

## Roadmap

- Support separate build and deployment/runtime namespaces.
- Support non-public GitHub access (HTTPS and SSH).
- Support non-public GitLab access.
- Support external image registries (configuration and auth).
- Support kustomize manifests
- Support non-template manifests (JSON and YAML)
- Support helm charts

## Credits

- Jabos uses [the kaniko project](https://github.com/GoogleContainerTools/kaniko) to build docker images inside the kubernetes cluster.
