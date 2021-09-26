function(imagePrefix, buildNumber) (
  local kube = import './kube.libsonnet';
  kube.CRD('GitRepository', 'gitrepository', 'gitrepositories', 'jabos.io', ['gr']) + {
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
                    runtimeNamespace: {
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
