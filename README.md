# jabos

**Just Another Boring Ops System**
Jabos attempts to be a fully automated K8s GitOps framework.

**This is WIP** - any comments, requests or issues would be welcome! please use [this link](https://github.com/srfrnk/jabos/issues)

## TL;DR - What does that mean?

### What you need to do?

1. Installing Jabos into your K8s cluster using
1. Setting up the K8s objects for your
   - Git Repository
   - Docker images
   - Manifest folder

### What happens next?

1. Any new commits would be picked up from Git automatically
1. Docker images would get build from new commits and pushed automatically
1. New manifest versions would be deployed automatically

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

See [definition here](./manifests/GitRepository.jsonnet)

### DockerImage

`DockerImage` objects define images, how to build and push them.

See [definition here](./manifests/DockerImage.jsonnet)

### JsonnetManifest

`JsonnetManifest` objects define a folder with [jsonnet](https://jsonnet.org/) based manifests to deploy.

See [definition here](./manifests/JsonnetManifests.jsonnet)

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

## Git Repository Authentication

### GitHub

#### Using SSH Keys

1. [Create an SSH key and add it to GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) - **Optionally skip the "adding it to the ssh-agent" section.**
1. Create a secret with the passphrase and key created in the previous step. (i.e. `kubectl create secret generic -n example-env first-repo-private --from-file=git_ssh_passphrase=./build/passphrase --from-file=git_ssh_key=./build/key`)
1. Add an `ssh` property to each applicable `GitRepository` object to point to the secret.

## Image Registry Authentication

### Docker Hub

1. Obtain your Docker Hub username.
1. Obtain your Docker Hub password or [access token](https://docs.docker.com/docker-hub/access-tokens/).
1. Create secret with the credentials. (i.e. `kubectl create secret generic -n example-env docker-hub --from-file=docker_hub_username=./build/docker_hub_username --from-file=docker_hub_password=./build/docker_hub_password`)
1. Add a `dockerHub` property to any applicable `DockerImage` object to point to the secret.

### GCP (GCR and Artifact Registry)

1. Obtain a Service Account with the required permissions.
1. Obtain the Service Account JSON key.
1. Create secret with the JSON key. (i.e. `kubectl create secret generic -n example-env gcp --from-file=gcp_service_account.json=./build/gcp_service_account.json`)
1. Add a `gcp` property to any applicable `DockerImage` object to point to the secret.

### AWS (ECR)

1. Obtain an [Access Key](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) with the required permissions.
1. Obtain the `Access key ID` and `Secret Access Key`.
1. Create secret with these credentials. (i.e. `kubectl create secret generic -n example-env aws --from-file=aws_access_key_id=./build/aws_access_key_id --from-file=aws_secret_access_key=./build/aws_secret_access_key`)
1. Add a `aws` property to any applicable `DockerImage` object to point to the secret.

### Metrics

All metrics are exported into `Prometheus` using the `ServiceMonitor` API by `kube-prometheus-stack`.
To otherwise configure `Prometheus` to collect the metrics you need to point it to 'OPERATOR_POD_IP:3000/metrics'.

All metrics exported are prefixed with `jabos_operator_`.
Numerous metrics are exported most of them describe `nodsjs` and `expresjs` operations.

Important metrics for the operation of Jabos are:

```yaml
# HELP jabos_operator_latest_commit_changed new "latest commit" detected for git repository
# TYPE jabos_operator_latest_commit_changed counter

# HELP jabos_operator_docker_image_build_trigger new build triggered for a docker image
# TYPE jabos_operator_docker_image_build_trigger counter

# HELP jabos_operator_jsonnet_manifests_build_trigger new build triggered for jsonnet manifests
# TYPE jabos_operator_jsonnet_manifests_build_trigger counter

# HELP jabos_operator_git_repository_updater_start GitRepositoryUpdater start
# TYPE jabos_operator_git_repository_updater_start counter

# HELP jabos_operator_git_repository_updater_end GitRepositoryUpdater end
# TYPE jabos_operator_git_repository_updater_end counter

# HELP jabos_operator_git_repository_updater_duration GitRepositoryUpdater duration
# TYPE jabos_operator_git_repository_updater_duration gauge

# HELP jabos_operator_docker_image_builder_start DockerImageBuilder start
# TYPE jabos_operator_docker_image_builder_start counter

# HELP jabos_operator_docker_image_builder_end DockerImageBuilder end
# TYPE jabos_operator_docker_image_builder_end counter

# HELP jabos_operator_docker_image_builder_duration DockerImageBuilder duration
# TYPE jabos_operator_docker_image_builder_duration gauge

# HELP jabos_operator_jsonnet_manifests_builder_start JsonnetManifestsBuilder start
# TYPE jabos_operator_jsonnet_manifests_builder_start counter

# HELP jabos_operator_jsonnet_manifests_builder_end JsonnetManifestsBuilder end
# TYPE jabos_operator_jsonnet_manifests_builder_end counter

# HELP jabos_operator_jsonnet_manifests_builder_duration JsonnetManifestsBuilder duration
# TYPE jabos_operator_jsonnet_manifests_builder_duration gauge
```

## Development

### Prerequisites

1. `make` installed (Depending on your OS - start [here](https://www.gnu.org/software/make/))
1. `docker` installed (To install wee [here](https://www.docker.com/get-started))
1. `minikube` installed (To install minikube see [this](https://minikube.sigs.k8s.io/docs/start/))
1. `NodeJS` installed (To install NodeJS see [this](https://nodejs.org))
1. `Typescript` development tools installed `npm install -g ts-node typescript '@types/node'`
1. `GNU Parallel` installed for [your OS](https://www.gnu.org/software/parallel/). For Debian based you can use `sudo apt-get install parallel`.

### Environment Setup

1. Clone repo: `git clone git@github.com:srfrnk/jabos.git` (or using HTTPS/GitHub CLI - see instructions [here](https://github.com/srfrnk/jabos))
1. CD into folder
1. Start a minikube cluster `minikube start`
1. Run `make setup` once
1. Run `make build` after each code change
1. Run terminal with `kubectl port-forward -n efk svc/efk-kibana 5601` then open [kibana](http://localhost:5601/app/discover)
1. To deploy examples
   1. Locally clone [jabos-examples repo](https://github.com/srfrnk/jabos-examples)
   1. Follow instructions from the README file in the cloned folder
   1. Locally clone [jabos-examples-private repo](https://github.com/srfrnk/jabos-examples-private)
   1. Follow instructions from the README file in the cloned folder
   1. Back within the `jabos` folder (from second step) run `make deploy-examples`
   1. The examples would be deployed into namespace `example-env`

## Credits

- Jabos uses [the kaniko project](https://github.com/GoogleContainerTools/kaniko) to build docker images inside the kubernetes cluster.
- Jabos uses [yq](https://github.com/mikefarah/yq) to parse and update yaml and json data.
- Jabos uses [jsonnet](github.com/google/go-jsonnet) to process jsonnet templates and create K8s manifests.
- Jabos uses [minikube](https://github.com/kubernetes/minikube) for local development
- Jabos uses [metacontroller](https://github.com/metacontroller/metacontroller) to control K8s operators.
- Jabos uses [efk-stack-helm](https://github.com/srfrnk/efk-stack-helm) for local centralized logging.
- Jabos uses [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) for local monitoring and alerting.
- Jabos uses [GNU Parallel](https://www.gnu.org/software/parallel/) for local port-forwarding to multiple services
- Jabos uses [expressjs](https://github.com/expressjs/express) as the web server to run the operator
- Jabos uses [express-prometheus-middleware](https://github.com/joao-fontenele/express-prometheus-middleware) to export basic metrics to prometheus
