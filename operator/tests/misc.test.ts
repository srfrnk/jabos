import exp from 'constants';
import { debugId, getRepo } from '../misc';

test('misc getRepo no related', () => {
  expect(() => {
    getRepo({
      object: {
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: undefined,
      finalizing: false,
      controller: {}
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing repo', () => {
  expect(() => {
    getRepo({
      object: {
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          undefined
        ]
      },
      finalizing: false,
      controller: {}
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing metadata', () => {
  expect(() => {
    getRepo({
      object: {
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {}
        ]
      },
      finalizing: false,
      controller: {}
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo missing namespace', () => {
  expect(() => {
    getRepo({
      object: {
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
            }
          }
        ]
      },
      finalizing: false,
      controller: {}
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo bad namespace', () => {
  expect(() => {
    getRepo({
      object: {
        metadata: {
          namespace: 'namespace_value'
        }
      },
      attachments: [],
      related: {
        'GitRepository.jabos.io/v1': [
          {
            metadata: {
              namespace: 'bad_namespace_value'
            }
          }
        ]
      },
      finalizing: false,
      controller: {}
    });
  }).toThrow('No GitRepository from same namespace.');
});

test('misc getRepo no spec and status', () => {
  expect(getRepo({
    object: {
      metadata: {
        namespace: 'namespace_value'
      }
    },
    attachments: [],
    related: {
      'GitRepository.jabos.io/v1': [
        {
          metadata: {
            namespace: 'namespace_value'
          },
        }
      ]
    },
    finalizing: false,
    controller: {}
  })).toMatchSnapshot();
});

test('debugId no value', () => {
  expect(debugId({})).toMatchSnapshot();
});

test('debugId undefined', () => {
  expect(debugId(undefined)).toMatchSnapshot();
});
