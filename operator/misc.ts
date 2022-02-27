import { SyncRequest } from './metaControllerHooks';

export function k8sName(prefix: string, commit: string): string {
  return `${prefix.substring(0, 52)}-${commit}`.substring(0, 62);
}

export type Repo = {
  spec: {
    url: string,
    branch: string,
    ssh?: {
      secret: string,
      passphrase: string,
      key: string
    }
  },
  status?: {
    latestCommit: string,
  }
};

export function getRepo(request: SyncRequest): Repo {
  const namespace = request.object.metadata.namespace;
  const reposMap = (request.related || {})['GitRepository.jabos.io/v1'];
  var repo: Repo;

  // Have to filter, due to the following bug: https://github.com/metacontroller/metacontroller/issues/414
  const repos = Object.values(reposMap || {}).filter((r: any) => r?.metadata?.namespace === namespace);
  if (repos.length > 0) {
    repo = repos[0] as Repo;
  }
  else {
    // Have to reject the sync to maintain idempotent response - due to: https://github.com/metacontroller/metacontroller/issues/414
    throw new Error(`No GitRepository from same namespace.`);
  }

  repo.spec = repo.spec || { url: '', branch: '', ssh: null };
  repo.status = repo.status || { latestCommit: '' };

  return repo;
}

export function getExistingJob(request: SyncRequest): any[] {
  return (Object.values(request.attachments['Job.batch/v1']).length > 0 ?
    [Object.values(request.attachments['Job.batch/v1'])[0]] :
    []).filter((job: any) => {
      delete job.status;
      delete job.metadata.annotations;
      return job;
    });
}

export function debugId(request: any) {
  var object = request?.object || request?.parent;
  return `${object?.metadata?.namespace}:${object?.metadata?.name}`;
}

export function needNewBuild(request: SyncRequest): boolean {
  const object = request.object;
  const repo = getRepo(request);
  const existingJob = getExistingJob(request);
  const builtCommit: string = (object.status || {}).builtCommit || '';
  const latestCommit: string = repo.status.latestCommit;
  return existingJob.length == 0 && !!latestCommit && latestCommit !== builtCommit;
}
