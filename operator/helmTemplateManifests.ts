import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var spec: any = request.body.object.spec;
    var latestCommit = (repo.status || {}).latestCommit;

    var commitValueKey = spec.commitValueKey;
    var values = spec.values;
    values[commitValueKey] = latestCommit;

    var args = Object.entries(values).map(value => `--set-string "${value[0]}=${value[1]}"`);

    await genericManifests.sync('helmTemplate', 'helm-template', 'helm_template', args, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('helmTemplate', request, response);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.finalize('helmTemplate', request, response);
  }
}
