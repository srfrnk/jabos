import { Request, Response, NextFunction } from 'express';

import genericManifests from './genericManifests'
import { getRepo } from './misc';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    var repo = getRepo(request);
    var spec: any = request.body.object.spec;
    var latestCommit = repo.status.latestCommit;

    var replacementPrefix = spec.replacementPrefix;
    var replacementSuffix = spec.replacementSuffix;
    var commitReplacementString = spec.commitReplacementString;
    var replacements = spec.replacements;
    replacements[commitReplacementString] = latestCommit;

    await genericManifests.sync('plain', 'plain', 'plain', {
      'REPLACEMENT_STRINGS': Object.entries(replacements)
        .map(replacement => `s/${replacementPrefix}${replacement[0]}${replacementSuffix}/${replacement[1]}/g`)
        .join(';')
    }, request, response);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.customize('plain', request, response);
  },

  async finalize(request: Request, response: Response, next: NextFunction) {
    await genericManifests.finalize('plain', request, response);
  }
}
