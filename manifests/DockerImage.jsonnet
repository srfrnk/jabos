function(imagePrefix, buildNumber, namespace, isProduction) (
  local kube = import './kube.libsonnet';
  kube.CRD(kind='DockerImage',
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
                   description: '`DockerImage` objects define images, how to build and push them.',
                   required: ['spec'],
                   properties: {
                     spec: {
                       type: 'object',
                       required: ['gitRepository', 'imageName'],
                       properties: {
                         gitRepository: {
                           type: 'string',
                           description: 'The name of a `GitRepository` object which defines the codebase for the image. **Must be in the same namespace**.',
                         },
                         contextPath: {
                           type: 'string',
                           default: '.',
                           description: 'The path **relative to the git repository root** where the context for the docker build is found.',
                         },
                         dockerFile: {
                           type: 'string',
                           default: 'Dockerfile',
                           description: 'The name of the Dockerfile to use for the docker build.',
                         },
                         imageName: {
                           type: 'string',
                           description: 'The full image name excluding the tag part. Usually this will be prefixed with the registry address (e.g. `registry.kube-system:80/example-image`)',
                         },
                         build: {
                           type: 'boolean',
                           default: true,
                           description: '"true" to use automatically build and push any new commit.',
                         },
                         insecureRegistry: {
                           type: 'boolean',
                           default: true,
                           description: '"true" to use insecure registries with docker push.',
                         },
                         dockerConfig: {
                           type: 'object',
                           additionalProperties: true,
                           default: {},
                           description: 'Docker config yaml file to use. This allows configuring `Kaniko` access to external registries if required. **Be careful not to include any secret information as this value is logged.**',
                         },
                         dockerHub: {
                           type: 'object',
                           required: ['secret'],
                           description: '`Docker Hub` credentials to use',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             username: {
                               type: 'string',
                               default: 'docker_hub_username',
                               description: 'Name of the key inside the secret to use for username.',
                             },
                             password: {
                               type: 'string',
                               default: 'docker_hub_password',
                               description: 'Name of the key inside the secret to use for password.',
                             },
                           },
                         },
                         gcp: {
                           type: 'object',
                           required: ['secret'],
                           description: '`GCP` credentials to use',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             serviceAccountKey: {
                               type: 'string',
                               default: 'gcp_service_account.json',
                               description: 'Name of the key inside the secret to use for the service account json key.',
                             },
                           },
                         },
                         aws: {
                           type: 'object',
                           required: ['secret'],
                           description: '`AWS` credentials to use',
                           properties: {
                             secret: {
                               type: 'string',
                               description: 'Name of secret to use. **Must be in the same namespace**',
                             },
                             accessKeyId: {
                               type: 'string',
                               default: 'aws_access_key_id',
                               description: 'Name of the key inside the secret to use for the aws_access_key_id.',
                             },
                             secretAccessKey: {
                               type: 'string',
                               default: 'aws_secret_access_key',
                               description: 'Name of the key inside the secret to use for the aws_secret_access_key.',
                             },
                           },
                         },
                       },
                     },
                     status: {
                       description: 'Will contains a condition of type "`Synced`". If it becomes "`False`" an `Event` will describe the error.',
                       properties: {
                         latestCommit: {
                           type: 'string',
                           description: 'The latest `git` commit id found',
                         },
                         builtCommit: {
                           type: 'string',
                           description: 'The latest `git` commit id build',
                         },
                       },
                     },
                   },
                 },
               },
             },
           ])
)
