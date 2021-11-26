import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo: any = Object.values(request.body.related['GitRepository.jabos.io/v1'])[0];
    var spec: any = request.body.object.spec;
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var args = [`--tla-str "${spec.commitTLAKey}=${latestCommit}"`];

    await genericManifests.sync('jsonnet', 'jsonnet', 'jsonnet', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('jsonnet', request, response);
  }
}
