export default function (options: {
  namespace: string,
  targetNamespace: string,
}) {
  return {
    "apiVersion": "rbac.authorization.k8s.io/v1",
    "kind": "Role",
    "metadata": {
      "name": "deployer",
      "namespace": options.targetNamespace,
    },
    "rules": [
      {
        "apiGroups": ["*"],
        "resources": ["*"],
        "verbs": ["get", "list", "watch", "create", "update", "patch"/* , "delete" */],
      }
    ],
  };
}
