import dockerHubSecretEnv from '../dockerHubSecretEnv';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('dockerHubSecretEnv without input', () => {
  expect(dockerHubSecretEnv(undefined)).toMatchSnapshot();
});

test('dockerHubSecretEnv with input', () => {
  const dockerHub = {
    secret: 'secret_value',
    username: 'username_value',
    password: 'password_value'
  }
  expect(dockerHubSecretEnv(dockerHub)).toMatchSnapshot();
});
