{
  CRD(kind, singular, plural, group, shortNames):: ({
                                                      apiVersion: 'apiextensions.k8s.io/v1',
                                                      kind: 'CustomResourceDefinition',
                                                      metadata: {
                                                        name: plural + '.' + group,
                                                      },
                                                      spec: {
                                                        group: group,
                                                        scope: 'Namespaced',
                                                        names: {
                                                          plural: plural,
                                                          singular: singular,
                                                          kind: kind,
                                                          shortNames: shortNames,
                                                        },
                                                      },
                                                    }),
  Deployment(name, replicas, containers):: ({
                                              apiVersion: 'apps/v1',
                                              kind: 'Deployment',
                                              metadata: {
                                                name: name,
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
                                                    containers: containers,
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
}
