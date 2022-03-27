import settings from '../settings';
import { Response } from 'express';
import mockResponse from './mockResponse';
import genericManifests from '../genericManifests';
import { CustomizeRequest, FinalizeRequest, SyncRequest } from '../metaControllerHooks';
import { clearMock, setMock } from './settingsMock';
import { Quantity } from '../imports/k8s';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('debugRequest debug', () => {
  (settings.debug as jest.Mock).mockReturnValue(true);
  const consoleWarnMock = jest.spyOn(console, 'log').mockImplementation();
  genericManifests.debugRequest('typeName', 'typeFunc', {
    apiVersion: 'apiVersion_value',
    kind: 'kind_version',
    metadata: {
      namespace: 'namespace_value',
      name: 'name_value'
    }
  },
    {
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      },
    }
  );
  expect((console.log as any).mock.calls[0]).toMatchSnapshot();
  consoleWarnMock.mockRestore();
});

test('debugRequest not debug', () => {
  (settings.debug as jest.Mock).mockReturnValue(false);
  const consoleWarnMock = jest.spyOn(console, 'log').mockImplementation();
  genericManifests.debugRequest('typeName', 'typeFunc',
    {
      apiVersion: 'apiVersion_value',
      kind: 'kind_version',
      metadata: {
        namespace: 'namespace_value',
        name: 'name_value'
      }
    },
    {
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      },
    });
  expect((console.log as any).mock.calls[0]).toMatchSnapshot();
  consoleWarnMock.mockRestore();
});

test('genericManifests sync same commit no trigger', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
      'Job.batch/v1': []
    }
  } as unknown as SyncRequest;
  const res = mockResponse();
  await genericManifests.sync({
    metricName: 'metricName_value',
    type: 'type_value',
    metricLabel: 'metricLabel_value',
    env: { 'env1': 'value1' },
    volumes: [],
    volumeMounts: []
  }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests sync existing job no trigger', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
      'Job.batch/v1': [
        {
          metadata: { name: 'job_name' }
        }
      ]
    }
  } as unknown as SyncRequest;
  const res = mockResponse();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
      volumeMounts: []
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests sync trigger', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
      volumeMounts: []
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});

test('genericManifests customize', async () => {
  const req = {
    parent: {
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value'
      }
    },
  } as unknown as CustomizeRequest;
  const res = mockResponse();
  await genericManifests.customize('metricName_value', req, res as unknown as Response, []);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize no jobs - leave', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Leave',
        targetNamespace: 'target_namespace'
      },
    },
    attachments: {
      'Job.batch/v1': []
    }
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize running job - delete', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Delete',
        targetNamespace: 'target_namespace'
      },
    },
    attachments: {
      'Job.batch/v1': [
        {
          metadata: {
            labels: {
              type: 'manifest-cleaner'
            }
          },
          status: {
            succeeded: 0
          }
        }
      ]
    }
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize no running job - delete', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Delete',
        targetNamespace: 'target_namespace'
      },
    },
    attachments: {
      'Job.batch/v1': [
        {
          metadata: {
            labels: {
              type: 'manifest-cleaner'
            }
          },
          status: {
            succeeded: 1
          }
        }
      ]
    }
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize no running - delete', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Delete',
        targetNamespace: 'target_namespace'
      },
    },
    attachments: {
      'Job.batch/v1': []
    }
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize no attachments', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Delete',
        targetNamespace: 'target_namespace'
      },
    },
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests finalize undefined job', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
        annotations: {
          deployedManifest: ''
        }
      },
      spec: {
        cleanupPolicy: 'Delete',
        targetNamespace: 'target_namespace'
      },
    },
    attachments: {
      'Job.batch/v1': [undefined]
    }
  } as unknown as FinalizeRequest;
  const res = mockResponse();
  await genericManifests.finalize('metricName_value', req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('genericManifests sync no volumes', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumeMounts: []
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});

test('genericManifests sync no volumeMounts', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});

test('genericManifests sync with empty resources', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
      volumeMounts: [],
      resources: {}
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});

test('genericManifests sync with resource limits', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
      volumeMounts: [],
      resources: {
        limits: {
          cpu: Quantity.fromNumber(1234)
        }
      }
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});

test('genericManifests sync with empty resource requests', async () => {
  const req = {
    controller: {
      metadata: {
        name: 'controller_name'
      }
    },
    object: {
      kind: 'kind_value',
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        gitRepository: 'gitRepository_value',
        path: '.',
        targetNamespace: 'targetNamespace_value'
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
  } as unknown as SyncRequest;
  const res = mockResponse();
  const metrics = require('../metrics');
  metrics.addMetric = jest.fn();
  await genericManifests.sync(
    {
      metricName: 'metricName_value',
      type: 'type_value',
      metricLabel: 'metricLabel_value',
      env: { 'env1': 'value1' },
      volumes: [],
      volumeMounts: [],
      resources: {
        requests: {
          cpu: Quantity.fromNumber(1234)
        }
      }
    }, req, res as unknown as Response);
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
  (metrics.addMetric as jest.Mock).mockReset();
});
