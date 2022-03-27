import { Request, Response } from 'express';
import mockResponse from './mockResponse';
import cdk8sManifests from '../cdk8sManifests';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('cdk8sManifests sync', async () => {
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
          commitEnvKey: 'commitEnvKey_value',
          targetNamespace: 'namespace_value',
          gitRepository: 'gitRepository_value',
          path: '.',
          env: {}
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
  await cdk8sManifests.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('cdk8sManifests customize', async () => {
  const req = {
    body: {
      parent: {
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value'
        },
        spec: {
          gitRepository: 'gitRepository_value'
        }
      },
    }
  } as unknown as Request;
  const res = mockResponse();
  await cdk8sManifests.customize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('cdk8sManifests finalize leave', async () => {
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
  await cdk8sManifests.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('cdk8sManifests finalize delete', async () => {
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
  await cdk8sManifests.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});