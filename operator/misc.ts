import { Request } from 'express';

export function k8sName(prefix: string, commit: string): string {
  return `${prefix.substring(0, 52)}-${commit}`.substring(0, 62);
}

export type Repo = {
  spec: {
    url: string, branch: string, ssh: {
      secret: string,
      passphrase: string,
      key: string
    }
  },
  status: {
    latestCommit: string,
  }
};

export function getRepo(request: Request): Repo {
  var repo: Repo = {} as Repo;

  var namespace = request.body.object.metadata.namespace;
  var related = request.body.related;
  if (!!related) {
    var reposMap = related['GitRepository.jabos.io/v1'];
    if (!!reposMap) {
      // Have to filter, due to the following bug: https://github.com/metacontroller/metacontroller/issues/414
      var repos = Object.values(reposMap).filter((r: any) => r.metadata.namespace === namespace);
      if (repos.length > 0) {
        repo = repos[0] as Repo;
      }
      else {
        // Have to reject the sync to maintain idempotent response - due to: https://github.com/metacontroller/metacontroller/issues/414
        throw new Error(`No GitRepository from same namespace.`);
      }
    }
  }

  repo.spec = repo.spec || { url: '', branch: '', ssh: null };
  repo.status = repo.status || { latestCommit: '' };

  return repo;
}

export function getExistingJob(request: Request): any[] {
  return (Object.values(request.body.attachments['Job.batch/v1']).length > 0 ?
    [Object.values(request.body.attachments['Job.batch/v1'])[0]] :
    []).filter((job: any) => {
      delete job.status;
      delete job.metadata.annotations;
      return job;
    });
}

export function debugId(request: Request) {
  try {
    const object = request.body.parent || request.body.object;
    return `${object.metadata.namespace}:${object.metadata.name}`;
  }
  catch {
    return '(NO_OBJECT)';
  }
}

export function needNewBuild(request: Request): boolean {
  const object = request.body.object;
  const repo = getRepo(request);
  const existingJob = getExistingJob(request);
  var builtCommit: string = (object.status || {}).builtCommit || '';
  var latestCommit: string = repo.status.latestCommit;
  return existingJob.length == 0 && !!latestCommit && latestCommit !== builtCommit;
}
