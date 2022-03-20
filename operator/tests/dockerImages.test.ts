import { Request, Response } from 'express';
import mockResponse from './mockResponse';
import dockerImages, { INTERNAL_allowInsecureExecutionForKaniko } from '../dockerImages';
import { clearMock, setMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('dockerImages sync no trigger', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        status: {
          builtCommit: 'commit_value'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': [
          {
            metadata: { namespace: 'namespace_value', name: 'job_name' }
          }
        ]
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger build', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: true,
          imageName: 'repo_host:port/imageName_value',
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name'
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value',
              name: 'git_repo_name'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger build with insecureRegistry', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: true,
          imageName: 'repo_host:port/imageName_value',
          insecureRegistry: true,
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name'
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger build with aws', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: true,
          imageName: 'repo_host:port/imageName_value',
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name',
          aws: {
            secret: 'secret_value',
            accessKeyId: 'accessKeyId_value',
            secretAccessKey: 'secretAccessKey_value'
          }
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value',
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger reuse', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: false,
          imageName: 'repo_host:port/imageName_value',
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name'
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger reuse with insecureRegistry', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: false,
          imageName: 'repo_host:port/imageName_value',
          insecureRegistry: true,
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name'
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger reuse with aws', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: false,
          imageName: 'repo_host:port/imageName_value',
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name',
          aws: {
            secret: 'secret_value',
            accessKeyId: 'accessKeyId_value',
            secretAccessKey: 'secretAccessKey_value'
          }
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages customize', async () => {
  const req = {
    body: {
      parent: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          gitRepository: 'gitRepository_value'
        }
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.customize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages finalize', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        }
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('dockerImages sync trigger bad imageName', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'object_name',
          uid: 'object_uid',
          namespace: 'namespace_value'
        },
        spec: {
          build: true,
          imageName: '!!!/bad_imageName_value',
          dockerConfig: {},
          contextPath: '.',
          dockerFile: 'Dockerfile',
          gitRepository: 'git_repo_name'
        },
        status: {
          builtCommit: 'commit_value1'
        }
      },
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'namespace_value',
              name: 'git_repo_name'
            },
            spec: {
              url: 'url_value',
              branch: 'branch_value'
            },
            status: {
              latestCommit: 'commit_value'
            }
          }
        ]
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('allowInsecureExecutionForKaniko no value', () => {
  expect(INTERNAL_allowInsecureExecutionForKaniko(undefined)).toMatchSnapshot();
});

test('allowInsecureExecutionForKaniko undefined container', () => {
  expect(INTERNAL_allowInsecureExecutionForKaniko({
    spec: {
      template: {
        spec: {
          containers: [],
          initContainers: [undefined]
        }
      }
    }
  })).toMatchSnapshot();
});


test('Issue #60 1', async () => {
  const req = {
    body: require('./test_input/issue#60.1.json')
  } as Request;

  const res = mockResponse();
  await dockerImages.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0][0].attachments[0].metadata.annotations['metacontroller.k8s.io/last-applied-configuration']).toBeUndefined();
  expect(res.status).toHaveBeenCalledWith(200);
});
