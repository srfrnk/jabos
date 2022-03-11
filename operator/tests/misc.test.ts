import { ApiObjectProps } from 'cdk8s';
import { debugId, getRepo } from '../misc';

test('misc getRepo no related', () => {
  expect(() => {
    getRepo({
      object: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: undefined,
      finalizing: false,
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      }
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing repo', () => {
  expect(() => {
    getRepo({
      object: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          undefined as ApiObjectProps
        ]
      },
      finalizing: false,
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      }
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing metadata', () => {
  expect(() => {
    getRepo({
      object: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {
            apiVersion: 'apiVersion_value',
            kind: 'kind_version',
          }
        ]
      },
      finalizing: false,
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      }
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing namespace', () => {
  expect(() => {
    getRepo({
      object: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {
            apiVersion: 'apiVersion_value',
            kind: 'kind_version',
            metadata: {
            }
          }
        ]
      },
      finalizing: false,
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      }
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo bad namespace', () => {
  expect(() => {
    getRepo({
      object: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {
            apiVersion: 'apiVersion_value',
            kind: 'kind_version',
            metadata: {
              namespace: 'bad_namespace_value'
            }
          }
        ]
      },
      finalizing: false,
      controller: {
        apiVersion: 'apiVersion_value',
        kind: 'kind_version',
      }
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo no spec and status', () => {
  expect(getRepo({
    object: {
      apiVersion: 'apiVersion_value',
      kind: 'kind_version',
      metadata: {
        namespace: 'namespace_value'
      }
    },
    attachments: [],
    related: {
      'GitRepository.jabos.io/v1': [
        {
          apiVersion: 'apiVersion_value',
          kind: 'kind_version',
          metadata: {
            namespace: 'namespace_value'
          },
        }
      ]
    },
    finalizing: false,
    controller: {
      apiVersion: 'apiVersion_value',
      kind: 'kind_version',
    }
  })).toMatchSnapshot();
});

test('debugId no value', () => {
  expect(debugId({} as ApiObjectProps)).toMatchSnapshot();
});

test('debugId undefined', () => {
  expect(debugId(undefined as ApiObjectProps)).toMatchSnapshot();
});
