{
  Manifests(kind, singular, plural, shortNames=[]):: (
    local kube = import './kube.libsonnet';
    kube.CRD(kind=kind, singular=singular, plural=plural, group='jabos.io', shortNames=shortNames) + {
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
                      path: {
                        type: 'string',
                        default: '.',
                      },
                      targetNamespace: {
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
  ),
}
