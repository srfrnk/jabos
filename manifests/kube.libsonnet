{
  CRD(isCluserScoped, kind, singular, plural, group, shortNames=[], versions=[]):: ({
                                                                                      apiVersion: 'apiextensions.k8s.io/v1',
                                                                                      kind: 'CustomResourceDefinition',
                                                                                      metadata: {
                                                                                        name: plural + '.' + group,
                                                                                      },
                                                                                      spec: {
                                                                                        group: group,
                                                                                        scope: if isCluserScoped then 'Cluster' else 'Namespaced',
                                                                                        versions: versions,
                                                                                        names: {
                                                                                          plural: plural,
                                                                                          singular: singular,
                                                                                          kind: kind,
                                                                                          shortNames: shortNames,
                                                                                        },
                                                                                      },
                                                                                    }),
  Deployment(namespace, name, replicas, serviceAccountName=null, containers=[], volumes=[]):: ({
                                                                                                 apiVersion: 'apps/v1',
                                                                                                 kind: 'Deployment',
                                                                                                 metadata: {
                                                                                                   name: name,
                                                                                                   namespace: namespace,
                                                                                                 },
                                                                                                 spec: {
                                                                                                   replicas: replicas,
                                                                                                   selector: {
                                                                                                     matchLabels: {
                                                                                                       app: name,
                                                                                                     },
                                                                                                   },
                                                                                                   template: {
                                                                                                     metadata: {
                                                                                                       labels:
                                                                                                         {
                                                                                                           app: name,
                                                                                                         },
                                                                                                     },
                                                                                                     spec: {
                                                                                                       [if serviceAccountName != null then 'serviceAccountName' else null]: serviceAccountName,
                                                                                                       containers: containers,
                                                                                                       volumes: volumes,
                                                                                                     },
                                                                                                   },
                                                                                                 },
                                                                                               }),
  Container(name, image):: ({
                              name: name,
                              image: image,
                              livenessProbe: {
                                initialDelaySeconds: 10,
                                periodSeconds: 30,
                                timeoutSeconds: 5,
                                failureThreshold: 3,
                                successThreshold: 1,
                              },
                              readinessProbe: {
                                initialDelaySeconds: 10,
                                periodSeconds: 30,
                                timeoutSeconds: 5,
                                failureThreshold: 3,
                                successThreshold: 1,
                              },
                              imagePullPolicy: 'IfNotPresent',
                            }),
  HeadlessService(namespace, name, selector, ports):: ({
                                                         apiVersion: 'v1',
                                                         kind: 'Service',
                                                         metadata: {
                                                           name: name,
                                                           namespace: namespace,
                                                         },
                                                         spec: {
                                                           clusterIP: 'None',
                                                           selector: selector,
                                                           ports: ports,
                                                         },
                                                       }),
  ServiceAccount(name, namespace):: ({
                                       apiVersion: 'v1',
                                       kind: 'ServiceAccount',
                                       metadata: {
                                         name: name,
                                         namespace: namespace,
                                       },
                                     }),
  Role(name, namespace, rules=[]):: ({
                                       apiVersion: 'rbac.authorization.k8s.io/v1',
                                       kind: 'Role',
                                       metadata: {
                                         name: name,
                                         namespace: namespace,
                                       },
                                       rules: rules,
                                     }),
  PolicyRule(apiGroups=[], resources=[], verbs=[], resourceNames=[], nonResourceURLs=[]):: ({
                                                                                              apiGroups: apiGroups,
                                                                                              resources: resources,
                                                                                              verbs: verbs,
                                                                                              resourceNames: resourceNames,
                                                                                              nonResourceURLs: nonResourceURLs,
                                                                                            }),

  RoleBinding(name, namespace, roleName, subjects=[]):: ({
                                                           apiVersion: 'rbac.authorization.k8s.io/v1',
                                                           kind: 'RoleBinding',
                                                           metadata: {
                                                             name: name,
                                                             namespace: namespace,
                                                           },
                                                           roleRef: {
                                                             apiGroup: 'rbac.authorization.k8s.io',
                                                             kind: 'Role',
                                                             name: roleName,
                                                           },
                                                           subjects: subjects,
                                                         }),
  Subject(apiGroup, kind, name, namespace):: ({
                                                apiGroup: apiGroup,
                                                kind: kind,
                                                namespace: namespace,
                                                name: name,
                                              }),
}
