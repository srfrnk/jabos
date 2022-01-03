import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var spec: any = request.body.object.spec;
    var latestCommit = (repo.status || {}).latestCommit;

    var args = [`--tla-str "${spec.commitTLAKey}=${latestCommit}"`];

    await genericManifests.sync('jsonnet', 'jsonnet', 'jsonnet', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('jsonnet', request, response);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.finalize('jsonnet', request, response);
  }
}
