# jabos

Just Another Boring Ops System

## Local environment setup

### Prerequisites:

1. `make` installed (Depending on your OS - start [here](https://www.gnu.org/software/make/))
1. `docker` installed (To install wee [here](https://www.docker.com/get-started))
1. `minikube` installed (To install minikube see [this](https://minikube.sigs.k8s.io/docs/start/))

### Setup:

1. Clone repo: `git clone git@github.com:srfrnk/jabos.git` (or using HTTPS/GitHub CLI - see instructions [here](https://github.com/srfrnk/jabos))
1. Cd into folder
1. Start a minikube cluster `minikube start`
1. Run `make local-setup`
1. Run `make local-build`
