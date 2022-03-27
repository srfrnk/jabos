import { App, Chart } from 'cdk8s';
import { Container, KubeJob, Volume } from '../imports/k8s';
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
      apiVersion: 'apiVersion_value',
      kind: 'kind_version',
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
    containers: [{} as Container],
    volumes: [],
    metricName: 'metricName_value',
    metricLabels: {},
    kind: 'kind_value',
    controller: 'controller_name'
  }
  const chart = new Chart(new App(), 'chart');
  expect(new KubeJob(chart, 'job', manifestBuilderJob(options)).toJson()).toMatchSnapshot();
});

test('manifestBuilderJob no containers', () => {
  const options = {
    object: {
      apiVersion: 'apiVersion_value',
      kind: 'kind_version',
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
    containers: undefined,
    volumes: [],
    metricName: 'metricName_value',
    metricLabels: {},
    kind: 'kind_value',
    controller: 'controller_name'
  }
  const chart = new Chart(new App(), 'chart');
  expect(new KubeJob(chart, 'job', manifestBuilderJob(options)).toJson()).toMatchSnapshot();
})