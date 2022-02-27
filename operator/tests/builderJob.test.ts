import builderJob from '../builderJob';
import { clearMock, setMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('awsSecretSources with options', () => {
  const options = {
    object: { metadata: { namespace: 'object_namespace', name: 'object_name', uid: 'object_uid' } },
    jobNamePrefix: 'jobNamePrefix_value',
    imagePrefix: 'imagePrefix_value-',
    buildNumber: 'buildNumber_value',
    type: 'type_value',
    serviceAccountName: 'serviceAccountName_value',
    repo: { spec: { url: 'url_value', branch: 'branch_value' }, status: { latestCommit: 'latestCommit_value' } },
    containers: [{ metadata: { name: 'container_name' } }],
    volumes: [{ name: 'volume_name' }],
    metricName: 'metricName_value',
    metricLabels: { 'metricLabelName': 'metricLabelValue' },
    labels: { 'label_name': 'label_value' }
  }
  expect(builderJob(options)).toMatchSnapshot();
});

test('awsSecretSources with ssh', () => {
  const options = {
    object: { metadata: { namespace: 'object_namespace', name: 'object_name', uid: 'object_uid' } },
    jobNamePrefix: 'jobNamePrefix_value',
    imagePrefix: 'imagePrefix_value',
    buildNumber: 'buildNumber_value',
    type: 'type_value',
    serviceAccountName: 'serviceAccountName_value',
    repo: { spec: { url: 'url_value', branch: 'branch_value', ssh: { secret: 'secret_value', passphrase: 'passphrase_value', key: 'key_value' } }, status: { latestCommit: 'latestCommit_value' } },
    containers: [{ metadata: { name: 'container_name' } }],
    volumes: [{ name: 'volume_name' }],
    metricName: 'metricName_value',
    metricLabels: { 'metricLabelName': 'metricLabelValue' },
    labels: { 'label_name': 'label_value' }
  }
  expect(builderJob(options)).toMatchSnapshot();
});

test('awsSecretSources with no containers', () => {
  const options = {
    object: { metadata: { namespace: 'object_namespace', name: 'object_name', uid: 'object_uid' } },
    jobNamePrefix: 'jobNamePrefix_value',
    imagePrefix: 'imagePrefix_value',
    buildNumber: 'buildNumber_value',
    type: 'type_value',
    serviceAccountName: 'serviceAccountName_value',
    repo: { spec: { url: 'url_value', branch: 'branch_value' }, status: { latestCommit: 'latestCommit_value' } },
    containers: null,
    volumes: [{ name: 'volume_name' }],
    metricName: 'metricName_value',
    metricLabels: { 'metricLabelName': 'metricLabelValue' },
    labels: { 'label_name': 'label_value' }
  }
  expect(builderJob(options)).toMatchSnapshot();
});

test('awsSecretSources with no volumes', () => {
  const options = {
    object: { metadata: { namespace: 'object_namespace', name: 'object_name', uid: 'object_uid' } },
    jobNamePrefix: 'jobNamePrefix_value',
    imagePrefix: 'imagePrefix_value',
    buildNumber: 'buildNumber_value',
    type: 'type_value',
    serviceAccountName: 'serviceAccountName_value',
    repo: { spec: { url: 'url_value', branch: 'branch_value' }, status: { latestCommit: 'latestCommit_value' } },
    containers: [{ metadata: { name: 'container_name' } }],
    volumes: null,
    metricName: 'metricName_value',
    metricLabels: { 'metricLabelName': 'metricLabelValue' },
    labels: { 'label_name': 'label_value' }
  }
  expect(builderJob(options)).toMatchSnapshot();
});

