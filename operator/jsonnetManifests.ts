import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    genericManifests.debugRequest('jsonnet', 'sync', request);

    var repo = getRepo(request);
    var spec: any = request.body.object.spec;
    var latestCommit = repo.status.latestCommit;

    var args = [
      `--tla-str "${spec.commitTLAKey}=${latestCommit}"`,
      ...Object.entries(spec.tlas).map(tla => `--tla-str "${tla[0]}=${tla[1]}"`)
    ].join(' ');

    await genericManifests.sync('jsonnet', 'jsonnet', 'jsonnet', { 'JSONNET_ARGS': args }, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    genericManifests.debugRequest('jsonnet', 'customize', request);

    await genericManifests.customize('jsonnet', request, response);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    genericManifests.debugRequest('jsonnet', 'finalize', request);

    await genericManifests.finalize('jsonnet', request, response);
  }
}
