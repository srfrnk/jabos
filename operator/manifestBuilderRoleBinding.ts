export default function (options: {
  namespace: string,
  targetNamespace: string,
}) {
  return {
    "apiVersion": "rbac.authorization.k8s.io/v1",
    "kind": "RoleBinding",
    "metadata": {
      "name": "deployer",
      "namespace": options.targetNamespace,
    },
    "roleRef": {
      "apiGroup": "rbac.authorization.k8s.io",
      "kind": "Role",
      "name": "deployer",
    },
    "subjects": [
      {
        "kind": "ServiceAccount",
        "namespace": options.namespace,
        "name": "builder",
      }
    ],
  };
}
