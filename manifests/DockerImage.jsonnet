function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  kube.CRD(kind='DockerImage', singular='docker-image', plural='docker-images', group='jabos.io', shortNames=['dock']) + {
    spec+: {
      versions: [
        {
          name: 'v1',
          served: true,
          storage: true,
          schema: {
            openAPIV3Schema: {
              type: 'object',
              properties: {
                spec: {
                  type: 'object',
                  properties: {
                    gitRepository: {
                      type: 'string',
                    },
                    contextPath: {
                      type: 'string',
                      default: '.',
                    },
                    dockerFile: {
                      type: 'string',
                      default: 'Dockerfile',
                    },
                    imageName: {
                      type: 'string',
                    },
                    insecureRegistry: {
                      type: 'boolean',
                      default: true,
                    },
                    dockerConfig: {
                      type: 'object',
                      additionalProperties: true,
                      default: {},
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  }
)
