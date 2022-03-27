import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { Quantity } from './imports/k8s';
import { CustomizeRequest, FinalizeRequest, SyncRequest } from './metaControllerHooks';
import { getRepo } from './misc';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    genericManifests.debugRequest('cdk8s', 'sync', request.object, request);

    const repo = getRepo(request);
    const spec: any = request.object.spec;
    const latestCommit = repo.status.latestCommit;

    await genericManifests.sync({
      metricLabel: 'cdk8s',
      type: 'cdk8s',
      metricName: 'cdk8s',
      env: { ...spec.env, [spec.commitEnvKey]: latestCommit },
      volumeMounts: [
        {
          name: 'm2',
          mountPath: "/home/user/.m2"
        },
        {
          name: 'npm',
          mountPath: "/home/user/.npm"
        },
        {
          name: 'local',
          mountPath: "/home/user/.local"
        },
        {
          name: 'go',
          mountPath: "/home/user/go"
        },
        {
          name: 'cache',
          mountPath: "/home/user/.cache"
        }
      ],
      volumes: [
        {
          name: 'm2',
          emptyDir: {}
        },
        {
          name: 'npm',
          emptyDir: {}
        },
        {
          name: 'local',
          emptyDir: {}
        },
        {
          name: 'go',
          emptyDir: {}
        },
        {
          name: 'cache',
          emptyDir: {}
        }
      ],
      resources: {
        limits: {
          memory: Quantity.fromString("2Gi"),
        },
        requests: {
          memory: Quantity.fromString("1Gi"),
        }
      },
      writableGitFolder: true
    }, request, response);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    genericManifests.debugRequest('cdk8s', 'customize', request.parent, request);

    await genericManifests.customize('cdk8s', request, response);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    genericManifests.debugRequest('cdk8s', 'finalize', request.object, request);

    await genericManifests.finalize('cdk8s', request, response);
  }
}
