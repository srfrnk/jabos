import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import exec from './exec';
import settings from './settings';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("gitRepositories sync req", JSON.stringify(request.body));

    var namespace: string = request.body.object.metadata.namespace;
    var repo: any = request.body.object.spec;

    var dir = fs.mkdtempSync('/tempGit/');
    await exec(`git clone --bare --single-branch --depth 1 --branch ${repo.branch} ${repo.url} ${dir}`);
    var { stdout: latestCommit } = await exec('git log -n 1 --pretty=format:"%H" | head -n 1', {
      cwd: dir
    });
    fs.rmdirSync(dir, { recursive: true });

    var res = {
      "annotations": {
        "latestCommit": latestCommit,
      },
      "attachments": [
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "Role",
          "metadata": {
            "name": "builder",
            "namespace": namespace,
          },
          "rules": [
            {
              "apiGroups": ["jabos.io"],
              "resources": ["docker-images", "jsonnet-manifests"],
              "verbs": ["get", "list", "watch", "patch"],
            }
          ],
        },
        {
          "apiVersion": "rbac.authorization.k8s.io/v1",
          "kind": "RoleBinding",
          "metadata": {
            "name": "builder",
            "namespace": namespace,
          },
          "roleRef": {
            "apiGroup": "rbac.authorization.k8s.io",
            "kind": "Role",
            "name": "builder",
          },
          "subjects": [
            {
              "kind": "ServiceAccount",
              "namespace": namespace,
              "name": "builder",
            }
          ],
        },
        {
          "apiVersion": 'v1',
          "kind": 'ServiceAccount',
          "metadata": {
            "name": "builder",
            "namespace": namespace,
          },
        }
      ],
    };

    if (settings.debug()) console.log("gitRepositories sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    if (settings.debug()) console.log("gitRepositories customize req", JSON.stringify(request.body));

    var res = {
      "relatedResources": []
    };

    if (settings.debug()) console.log("gitRepositories customize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
