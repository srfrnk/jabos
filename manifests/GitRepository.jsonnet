function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  kube.CRD(kind='GitRepository', singular='git-repository', plural='git-repositories', group='jabos.io', shortNames=['repo']) + {
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
                    url: {
                      type: 'string',
                    },
                    branch: {
                      type: 'string',
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
