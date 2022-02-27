import gcpSecretSources from '../gcpSecretSources';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('gcpSecretSources empty', () => {
  expect(gcpSecretSources(undefined)).toMatchSnapshot();
});

test('gcpSecretSources', () => {
  expect(gcpSecretSources({
    secret: 'secret_value',
    serviceAccountKey: 'serviceAccountKey_value'
  })).toMatchSnapshot();
});
