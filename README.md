# jabos

![build](https://github.com/srfrnk/jabos/actions/workflows/push.yml/badge.svg?branch=main)
![GitHub release](https://img.shields.io/github/v/release/srfrnk/jabos?label=latest%20release&style=plastic)
![License](https://img.shields.io/badge/License-MTA-blue.svg)

Jabos attempts to be a fully automated K8s GitOps framework.

**This is WIP** - any comments, requests or issues would be welcome! please use <a href="https://github.com/srfrnk/jabos/issues" target="_blank">this link</a>

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

Video version:

1. <a href="https://youtu.be/616aMiKHtks" target="_blank">Minikube setup</a>
1. <a href="https://youtu.be/Ex5hi3GOkjg" target="_blank">Jabos and prerequisites</a>

Instructions:

1. Make sure Metacontroller is installed on your cluster. Find instructions <a href="https://metacontroller.github.io/metacontroller/guide/install.html" target="_blank">here</a>
1. Optionally install <a href="https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack" target="_blank">kube-prometheus-stack</a> to expose metrics from `jabos`
1. Optionally install <a href="https://github.com/srfrnk/grafana-dashboard-operator/" target="_blank">grafana-dashboard-operator</a> to setup grafana dashboards for `jabos`
1. Create a namespace for jabos to use. E.g. `kubectl create namespace jabos`. Use the same namespace with the next command.
1. Run `kubectl apply -n <NAMESPACE> -f https://github.com/srfrnk/jabos/releases/latest/download/jabos-manifests.yaml`

## Usage

Jabos uses <a href="https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/" target="_blank">CRDs</a> in order for users to define a codebase and how to build and deploy that.

See <a href="https://srfrnk.github.io/jabos" target="_blank">API Docs here</a>

Video version:

1. <a href="https://youtu.be/PqMUliEHx60" target="_blank">Configure CRDs</a>
1. <a href="https://youtu.be/OlB6qybsqng" target="_blank">Push changes and trigger builds</a>

### Jsonnet example

Create a file `example.jsonnet`:

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

### Git Repository Authentication

#### GitHub

##### Using SSH Keys

1. <a href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account" target="_blank">Create an SSH key and add it to GitHub</a> - **Optionally skip the "adding it to the ssh-agent" section.**
1. Create a secret with the passphrase and key created in the previous step. (i.e. `kubectl create secret generic -n example-env first-repo-private --from-file=git_ssh_passphrase=./build/passphrase --from-file=git_ssh_key=./build/key`)
1. Add an `ssh` property to each applicable `GitRepository` object to point to the secret.

### Image Registry Authentication

#### Docker Hub

1. Obtain your Docker Hub username.
1. Obtain your Docker Hub password or <a href="https://docs.docker.com/docker-hub/access-tokens/" target="_blank">access token</a>.
1. Create secret with the credentials. (i.e. `kubectl create secret generic -n example-env docker-hub --from-file=docker_hub_username=./build/docker_hub_username --from-file=docker_hub_password=./build/docker_hub_password`)
1. Add a `dockerHub` property to any applicable `DockerImage` object to point to the secret.

#### GCP (GCR and Artifact Registry)

1. Obtain a Service Account with the required permissions.
1. Obtain the Service Account JSON key.
1. Create secret with the JSON key. (i.e. `kubectl create secret generic -n example-env gcp --from-file=gcp_service_account.json=./build/gcp_service_account.json`)
1. Add a `gcp` property to any applicable `DockerImage` object to point to the secret.

#### AWS (ECR)

1. Obtain an <a href="https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/" target="_blank">Access Key</a> with the required permissions.
1. Obtain the `Access key ID` and `Secret Access Key`.
1. Create secret with these credentials. (i.e. `kubectl create secret generic -n example-env aws --from-file=aws_access_key_id=./build/aws_access_key_id --from-file=aws_secret_access_key=./build/aws_secret_access_key`)
1. Add a `aws` property to any applicable `DockerImage` object to point to the secret.

#### Metrics

All metrics are exported into `Prometheus` using the `ServiceMonitor` API by `kube-prometheus-stack`.
To otherwise configure `Prometheus` to collect the metrics you need to point it to 'OPERATOR_POD_IP:3000/metrics'.

All metrics exported are prefixed with `jabos_operator_`.
Numerous metrics are exported most of them describe `nodsjs` and `expresjs` operations. [**Removed due to security audit fails**](#34)

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

## Use Cases

Diagrams for supported and future planned use-cases [are here](https://miro.com/app/board/uXjVOY5CIn0=)

### Image Reuse

Build images in DEV/QA only and reuse when commit is promoted to other environments.
To mark a `DockerImage` for reuse of an image built in another environnement add `build: false` to the spec.

## Security

`Jabos` images and manifest are being scanned by [`CodeQL`](https://codeql.github.com/) and [`Snyk`](https://snyk.io/) as part of the release process using GitHub Actions.

`Jabos` makes no attempt at protecting applications, networks, disks from malicious access. It is the responsibility of the user to put in place such measures.

`Jabos` should always be contained inside a dedicated namespace to reduce risk to other systems.

**Special attention** must be given to the `Jabos` docker image builder pods which use `Kaniko`. At this time it is required for `Kaniko` to be executed with `root` user and with a writable file system. This known limitation is a low risk as these pods have a very short life span... however it does pose a risk especially when the code pulled from a `Git` repository may contain vulnerabilities.

**It is advisable to always scan all code which is pulled by `Jabos` from `Git`!**

**It is advisable to use `NetworkPolicy` and other methods to ensure any egress from docker image builder pods is limited to what is required by your images to build!**

### Security Overview

The scan results can be found [here](https://github.com/srfrnk/jabos/security)

As of version 1.x there are no known vulnerabilities.

### Reporting a Vulnerability

Create an issue [here](https://github.com/srfrnk/jabos/issues).
Please add a `security` label for quicker response.

## Development

### Prerequisites

1. `make` installed (Depending on your OS - start <a href="https://www.gnu.org/software/make/" target="_blank">here</a>)
1. `docker` installed (To install wee <a href="https://www.docker.com/get-started" target="_blank">here</a>)
1. `minikube` installed (To install minikube see <a href="https://minikube.sigs.k8s.io/docs/start/" target="_blank">this</a>)
1. `NodeJS` installed (To install NodeJS see <a href="https://nodejs.org" target="_blank">this</a>)
1. `Typescript` development tools installed `npm install -g ts-node typescript '@types/node'`
1. `GNU Parallel` installed for <a href="https://www.gnu.org/software/parallel/" target="_blank">your OS</a>. For Debian based you can use `sudo apt-get install parallel`.

### Environment Setup

1. Clone repo: `git clone git@github.com:srfrnk/jabos.git` (or using HTTPS/GitHub CLI - see instructions <a href="https://github.com/srfrnk/jabos" target="_blank">here</a>)
1. CD into folder
1. Start a minikube cluster `minikube start`
1. Run `make setup` once
1. Run `make build` after each code change
1. Run terminal with `kubectl port-forward -n efk svc/efk-kibana 5601` then open <a href="http://localhost:5601/app/discover" target="_blank">kibana</a>
1. To deploy examples
   1. Locally clone <a href="https://github.com/srfrnk/jabos-examples" target="_blank">jabos-examples repo</a>
   1. Follow instructions from the README file in the cloned folder
   1. The examples would be deployed into namespace `example-env`

## Credits

- Jabos uses <a href="https://github.com/GoogleContainerTools/kaniko" target="_blank">the kaniko project</a> to build docker images inside the kubernetes cluster.
- Jabos uses <a href="https://github.com/mikefarah/yq" target="_blank">yq</a> to parse and update yaml and json data.
- Jabos uses <a href="github.com/google/go-jsonnet" target="_blank">jsonnet</a> to process jsonnet templates and create K8s manifests.
- Jabos uses <a href="https://github.com/kubernetes/minikube" target="_blank">minikube</a> for local development
- Jabos uses <a href="https://github.com/metacontroller/metacontroller" target="_blank">metacontroller</a> to control K8s operators.
- Jabos uses <a href="https://github.com/srfrnk/efk-stack-helm" target="_blank">efk-stack-helm</a> for local centralized logging.
- Jabos uses <a href="https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack" target="_blank">kube-prometheus-stack</a> for local monitoring and alerting.
- Jabos uses <a href="https://www.gnu.org/software/parallel/" target="_blank">GNU Parallel</a> for local port-forwarding to multiple services
- Jabos uses <a href="https://github.com/expressjs/express" target="_blank">expressjs</a> as the web server to run the operator
- [**Removed due to security audit fails**](#34) - Jabos uses <a href="https://github.com/joao-fontenele/express-prometheus-middleware" target="_blank">express-prometheus-middleware</a> to export basic metrics to prometheus
