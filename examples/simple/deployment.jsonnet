function(commit) {
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
            image: 'registry.kube-system:80/example-image:' + commit,
          },
        ],
      },
    },
  },
}
