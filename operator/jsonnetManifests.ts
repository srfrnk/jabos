import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { CustomizeRequest, FinalizeRequest, SyncRequest } from './metaControllerHooks';
import { getRepo } from './misc';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    genericManifests.debugRequest('jsonnet', 'sync', request.object, request);

    const repo = getRepo(request);
    const spec: any = request.object.spec;
    const latestCommit = repo.status.latestCommit;

    const args = [
      `--tla-str "${spec.commitTLAKey}=${latestCommit}"`,
      ...Object.entries(spec.tlas).map(tla => `--tla-str "${tla[0]}=${tla[1]}"`)
    ].join(' ');

    await genericManifests.sync(
      {
        metricName: 'jsonnet',
        type: 'jsonnet',
        metricLabel: 'jsonnet',
        env: { 'JSONNET_ARGS': args }
      },
      request, response);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    genericManifests.debugRequest('jsonnet', 'customize', request.parent, request);

    await genericManifests.customize('jsonnet', request, response);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    genericManifests.debugRequest('jsonnet', 'finalize', request.object, request);

    await genericManifests.finalize('jsonnet', request, response);
  }
}
