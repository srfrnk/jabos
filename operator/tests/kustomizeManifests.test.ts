import { Request, Response } from 'express';
import mockResponse from './mockResponse';
import kustomizeManifests from '../kustomizeManifests';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('kustomizeManifests sync', async () => {
  const req = {
    body: {
      controller: {
        metadata: {
          name: 'controller_name'
        }
      },
      object: {
        kind: 'object_kind',
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value',
          uid: 'uid_value'
        },
        spec: {
          commitTLAKey: 'commitTLAKey_value',
          targetNamespace: 'namespace_value',
          gitRepository: 'gitRepository_value',
          path: '.',
          dockerImages: [],
          replacementPrefix: 'replacementPrefix_value',
          replacementSuffix: 'replacementSuffix_value',
          replacements: {}
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
  } as unknown as Request;
  const res = mockResponse();
  await kustomizeManifests.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('kustomizeManifests sync no image found', async () => {
  const req = {
    body: {
      controller: {
        metadata: {
          name: 'controller_name'
        }
      },
      object: {
        kind: 'object_kind',
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value',
          uid: 'uid_value'
        },
        spec: {
          commitTLAKey: 'commitTLAKey_value',
          targetNamespace: 'namespace_value',
          gitRepository: 'gitRepository_value',
          path: '.',
          dockerImages: ['invalid_image'],
          replacementPrefix: 'replacementPrefix_value',
          replacementSuffix: 'replacementSuffix_value',
          replacements: {}
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
  } as unknown as Request;
  const res = mockResponse();
  await expect(kustomizeManifests.sync(req, res as unknown as Response, () => { /* NOOP */ })).rejects.toMatchSnapshot();
});

test('kustomizeManifests customize', async () => {
  const req = {
    body: {
      parent: {
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value'
        },
        spec: {
          gitRepository: 'gitRepository_value',
          dockerImages: [],
        }
      },
    }
  } as unknown as Request;
  const res = mockResponse();
  await kustomizeManifests.customize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('kustomizeManifests finalize leave', async () => {
  const req = {
    body: {
      controller: {
        metadata: {
          name: 'controller_name'
        }
      },
      object: {
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value',
          annotations: {}
        },
        spec: {
          cleanupPolicy: 'Leave'
        }
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as unknown as Request;
  const res = mockResponse();
  await kustomizeManifests.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('kustomizeManifests finalize delete', async () => {
  const req = {
    body: {
      controller: {
        metadata: {
          name: 'controller_name'
        }
      },
      object: {
        kind: 'object_kind',
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value',
          annotations: { deployedManifest: 'deployedManifest_value' },
          uid: 'object_uid'
        },
        spec: {
          cleanupPolicy: 'Delete',
          targetNamespace: 'namespace_value',
        }
      },
      attachments: {
        'Job.batch/v1': []
      }
    }
  } as unknown as Request;
  const res = mockResponse();
  await kustomizeManifests.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('Issue #60', async () => {
  const req = {
    body: require('./test_input/issue#60.2.json')
  } as Request;

  const res = mockResponse();
  await kustomizeManifests.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0][0].attachments[2].metadata.annotations['metacontroller.k8s.io/last-applied-configuration']).toBeUndefined();
  expect(res.status).toHaveBeenCalledWith(200);
});
