import { ApiObjectProps, Chart } from 'cdk8s';
import { GitRepositoryProps } from './imports/jabos.io';
import { Container, KubeJob, KubeJobProps, KubeRoleBinding, Quantity } from './imports/k8s';
import { SyncRequest } from './metaControllerHooks';

export function k8sName(prefix: string, commit: string): string {
  return `${prefix.substring(0, 52)}-${commit}`.substring(0, 62);
}

export interface GitRepositoryPropsEx extends GitRepositoryProps {
  readonly status: {
    readonly latestCommit: string,
  }
}

export function getRepo(request: SyncRequest): GitRepositoryPropsEx {
  const namespace = request.object.metadata.namespace;
  const reposMap = (request.related || {})['GitRepository.jabos.io/v1'] /* as { [key: string]: GitRepositoryProps } */;
  var repo: GitRepositoryProps;

  // Have to filter, due to the following bug: https://github.com/metacontroller/metacontroller/issues/414
  const repos = Object.values(reposMap || {}).filter((r) => r?.metadata?.namespace === namespace);
  if (repos.length > 0) {
    repo = repos[0] as unknown as GitRepositoryProps;
  }
  else {
    // Have to reject the sync to maintain idempotent response - due to: https://github.com/metacontroller/metacontroller/issues/414
    throw new Error(`No GitRepository from same namespace.`);
  }

  return {
    status: { latestCommit: '' },
    spec: { url: '', branch: '', ssh: null },
    ...repo,
  };
}

function convertQuantities(resources: { [key: string]: (Quantity | string | number) }): { [key: string]: Quantity } {
  return Object.entries(resources).reduce((p, c) => {
    if (typeof c[1] === 'string') {
      p[c[0]] = Quantity.fromString(c[1]);
    }
    else if (typeof c[1] == 'number') {
      p[c[0]] = Quantity.fromNumber(c[1]);
    }
    else {
      p[c[0]] = c[1];
    }
    return p;
  }, {});
}

function convertContainers(containers: Container[]) {
  return containers.map(container => {
    return {
      ...container,
      ...(container.resources && {
        resources: {
          ...(container.resources.limits && { limits: convertQuantities(container.resources.limits) }),
          ...(container.resources.requests && { requests: convertQuantities(container.resources.requests) })
        }
      })
    };
  });
}

export function useExistingJob(chart: Chart, request: SyncRequest) {
  if (Object.values(request.attachments['Job.batch/v1']).length > 0) {
    var jobProps: KubeJobProps = Object.values(request.attachments['Job.batch/v1'])[0];
    jobProps = {
      ...jobProps,
      ...(jobProps.metadata && {
        metadata: {
          ...jobProps.metadata,
          ...(jobProps.metadata.annotations && {
            annotations: {
              ...jobProps.metadata.annotations,
              'metacontroller.k8s.io/last-applied-configuration': null
            },
          }),
        }
      }),
      ...(jobProps.spec && {
        spec: {
          ...jobProps.spec,
          ...(jobProps.spec.template && {
            template: {
              ...jobProps.spec.template,
              ...(jobProps.spec.template.spec && {
                spec: {
                  ...jobProps.spec.template.spec,
                  ...(jobProps.spec.template.spec.initContainers && { initContainers: convertContainers(jobProps.spec.template.spec.initContainers) }),
                  ...(jobProps.spec.template.spec.containers && { containers: convertContainers(jobProps.spec.template.spec.containers) }),
                }
              })
            }
          })
        }
      })
    };
    return new KubeJob(chart, jobProps.metadata.name, jobProps);
  }
}

export function debugId(object: ApiObjectProps) {
  return `${object?.metadata?.namespace}:${object?.metadata?.name}`;
}

export function needNewBuild(request: SyncRequest): boolean {
  const object = request.object;
  const repo = getRepo(request);
  const existingJob = Object.values(request.attachments['Job.batch/v1']).length > 0;
  const builtCommit: string = (object.status || {}).builtCommit || '';
  const latestCommit: string = repo.status.latestCommit;
  return !existingJob && !!latestCommit && latestCommit !== builtCommit;
}

export const _private = { convertQuantities: convertQuantities };
