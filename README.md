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

## Credits

- Jabos uses [the kaniko project](https://github.com/GoogleContainerTools/kaniko) to build docker images inside the kubernetes cluster.
