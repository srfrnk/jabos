import awsSecretSources from '../awsSecretSources';
import { clearMock, setMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('awsSecretSources without creds', () => {
  expect(awsSecretSources(undefined)).toMatchSnapshot();
});

test('awsSecretSources with creds', () => {
  const awsCreds = {
    secret: 'secret_name',
    accessKeyId: 'accessKeyId_name',
    secretAccessKey: 'secretAccessKey_name'
  }
  expect(awsSecretSources(awsCreds)).toMatchSnapshot();
});
