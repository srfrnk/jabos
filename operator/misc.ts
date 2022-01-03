import { Request } from 'express';

export function k8sName(prefix: string, commit: string): string {
  return `${prefix.substring(0, 52)}-${commit}`.substring(0, 62);
}

type Repo = {
  metadata: {
    annotations: {
      latestCommit: string
    }
  },
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
  var repo = {
    metadata: {
      annotations: {
        latestCommit: ''
      }
    },
    spec: {
      url: '',
      branch: '',
      ssh: null
    },
    status: {
      latestCommit: null
    }
  };

  var namespace = request.body.object.metadata.namespace;
  var related = request.body.related;
  if (!!related) {
    var reposMap = related['GitRepository.jabos.io/v1'];
    if (!!reposMap) {
      // Have to filter to do the following bug: https://github.com/metacontroller/metacontroller/issues/414
      var repos = Object.values(reposMap).filter((r: any) => r.metadata.namespace === namespace);
      if (repos.length > 0) {
        repo = repos[0] as Repo;
      }
    }
  }
  return repo;
}
