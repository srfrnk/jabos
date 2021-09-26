{
  CRD(kind, singular, plural, group, shortNames):: (
    {
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
    }
  ),
}
