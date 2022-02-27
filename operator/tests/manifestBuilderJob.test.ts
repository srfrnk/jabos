import manifestBuilderJob from '../manifestBuilderJob';
import { clearMock, setMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('manifestBuilderJob', () => {
  const options = {
    object: {
      metadata: {
        name: 'name_value',
        namespace: 'namespace_value',
        uid: 'uid_value',
      },
      spec: {
        targetNamespace: 'targetNamespace_value',
        gitRepository: 'gitRepository_value'
      },
    },
    repo: {
      spec: {
        url: 'repo_url',
        branch: 'repo_branch'
      },
      status: {
        latestCommit: 'latestCommit_value'
      }
    },
    imagePrefix: 'imagePrefix_value',
    buildNumber: 'buildNumber_value',
    type: 'type_value',
    containers: [{}],
    metricName: 'metricName_value',
    metricLabels: {},
    kind: 'kind_value',
    controller: 'controller_name'
  }
  expect(manifestBuilderJob(options)).toMatchSnapshot();
});

