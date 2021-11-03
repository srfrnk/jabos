{
  ServiceMonitor(namespace, name, namespaceSelector, selector, endpoints):: ({
                                                                               apiVersion: 'monitoring.coreos.com/v1',
                                                                               kind: 'ServiceMonitor',
                                                                               metadata: {
                                                                                 name: name,
                                                                                 namespace: namespace,
                                                                               },
                                                                               spec: {
                                                                                 namespaceSelector: namespaceSelector,
                                                                                 selector: selector,
                                                                                 endpoints: endpoints,
                                                                               },
                                                                             }),
  Endpoint(port, path, interval, scheme):: ({
                                              port: port,
                                              [if path != null then 'path' else null]: path,
                                              [if interval != null then 'interval' else null]: interval,
                                              [if scheme != null then 'scheme' else null]: scheme,
                                            }),
}
