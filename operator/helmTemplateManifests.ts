import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var spec: any = request.body.object.spec;
    var latestCommit: string = repo.metadata.annotations.latestCommit;

    var commitValueKey = spec.commitValueKey;
    var args = [commitValueKey, latestCommit];

    await genericManifests.sync('helmTemplate', 'helm-template', 'helm_template', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('helmTemplate', request, response);
  }
}
