export default function (options: {
  name: string,
  gitRepositoryName: string,
  namespace: string,
  targetNamespace: string,
}) {
  return {
    "apiVersion": "rbac.authorization.k8s.io/v1",
    "kind": "RoleBinding",
    "metadata": {
      "name": `deployer-${options.name}`,
      "namespace": options.targetNamespace,
    },
    "roleRef": {
      "apiGroup": "rbac.authorization.k8s.io",
      "kind": "Role",
      "name": `deployer-${options.name}`,
    },
    "subjects": [
      {
        "kind": "ServiceAccount",
        "namespace": options.namespace,
        "name": `builder-${options.gitRepositoryName}`,
      }
    ],
  };
}
