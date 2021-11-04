function(imagePrefix, buildNumber, namespace, debug) (
  local kube = import './kube.libsonnet';
  kube.CRD(isCluserScoped=false,
           kind='DockerImage',
           singular='docker-image',
           plural='docker-images',
           group='jabos.io',
           shortNames=['dock'],
           versions=[
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
                           description: 'The name of a `GitRepository` object which defines the codebase for the image. **Must be in the same namespace**.',
                         },
                         contextPath: {
                           type: 'string',
                           default: '.',
                           description: 'The path **relative to the git repository root** where the context for the docker build is found. Default: "." (Repository root)',
                         },
                         dockerFile: {
                           type: 'string',
                           default: 'Dockerfile',
                           description: 'The name of the Dockerfile to use for the docker build. Default: "Dockerfile"',
                         },
                         imageName: {
                           type: 'string',
                           description: 'The full image name excluding the tag part. Usually this will be prefixed with the registry address (e.g. `registry.kube-system:80/example-image`)',
                         },
                         insecureRegistry: {
                           type: 'boolean',
                           default: true,
                           description: '"true" to use insecure registries with docker push. Default: false',
                         },
                         dockerConfig: {
                           type: 'object',
                           additionalProperties: true,
                           default: {},
                           description: 'Optional docker config yaml file to use. This allows configuring `Kaniko` access to external registries if required. **Be careful not to include any secret information as this value is logged.**',
                         },
                         dockerHub: {
                           type: 'object',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             username: {
                               type: 'string',
                               default: 'username',
                               description: 'Name of the key inside the secret to use for username. Default: "username"',
                             },
                             password: {
                               type: 'string',
                               default: 'password',
                               description: 'Name of the key inside the secret to use for password. Default: "password"',
                             },
                           },
                         },
                         gcp: {
                           type: 'object',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             serviceAccountKey: {
                               type: 'string',
                               default: 'service_account.json',
                               description: 'Name of the key inside the secret to use for the service account json key. Default: "service_account.json"',
                             },
                           },
                         },
                       },
                     },
                   },
                 },
               },
             },
           ])
)
