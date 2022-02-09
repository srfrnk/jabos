import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { CustomizeRequest, FinalizeRequest, SyncRequest } from './metaControllerHooks';
import { getRepo } from './misc';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    genericManifests.debugRequest('helmTemplate', 'sync', request);

    const repo = getRepo(request);
    const spec: any = request.object.spec;
    const latestCommit = repo.status.latestCommit;

    const commitValueKey = spec.commitValueKey;
    const values = spec.values;
    values[commitValueKey] = latestCommit;

    const valuesEnv = Object.entries(values).map(value => `--set-string "${value[0]}=${value[1]}"`).join(' ');

    await genericManifests.sync('helmTemplate', 'helm-template', 'helm_template', { 'VALUES': valuesEnv }, request, response);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    genericManifests.debugRequest('helmTemplate', 'customize', request);

    await genericManifests.customize('helmTemplate', request, response);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    genericManifests.debugRequest('helmTemplate', 'finalize', request);

    await genericManifests.finalize('helmTemplate', request, response);
  }
}
