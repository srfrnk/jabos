local kube = import './kube.libsonnet';
kube.CRD('GitRepo', 'gitrepo', 'gitrepos', 'jabos', ['gr']) + {
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
                },
              },
            },
          },
        },
      },
    ],
  },
}
