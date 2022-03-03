import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { CustomizeRequest, FinalizeRequest, SyncRequest } from './metaControllerHooks';
import { getRepo } from './misc';

export default {
  async sync(syncRequest: Request, response: Response, next: NextFunction) {
    const request: SyncRequest = syncRequest.body;
    genericManifests.debugRequest('plain', 'sync', request.object, request);

    const repo = getRepo(request);
    const spec: any = request.object.spec;
    const latestCommit = repo.status.latestCommit;

    const replacementPrefix = spec.replacementPrefix;
    const replacementSuffix = spec.replacementSuffix;
    const commitReplacementString = spec.commitReplacementString;
    const replacements = spec.replacements;
    replacements[commitReplacementString] = latestCommit;

    await genericManifests.sync('plain', 'plain', 'plain', {
      'REPLACEMENT_STRINGS': Object.entries(replacements)
        .map(replacement => `s/${replacementPrefix}${replacement[0]}${replacementSuffix}/${replacement[1]}/g`)
        .join(';')
    }, request, response);
  },

  async customize(customizeRequest: Request, response: Response, next: NextFunction) {
    const request: CustomizeRequest = customizeRequest.body;
    genericManifests.debugRequest('plain', 'customize', request.parent, request);

    await genericManifests.customize('plain', request, response);
  },

  async finalize(finalizeRequest: Request, response: Response, next: NextFunction) {
    const request: FinalizeRequest = finalizeRequest.body;
    genericManifests.debugRequest('plain', 'finalize', request.object, request);

    await genericManifests.finalize('plain', request, response);
  }
}
