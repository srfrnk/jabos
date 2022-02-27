import gitRepositorySshSecretEnv from '../gitRepositorySshSecretEnv';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('gitRepositorySshSecretEnv empty', () => {
  expect(gitRepositorySshSecretEnv(undefined)).toMatchSnapshot();
});

test('gitRepositorySshSecretEnv', () => {
  expect(gitRepositorySshSecretEnv({
    secret: 'secret_value',
    passphrase: 'passphrase_value',
    key: 'key_value'
  })).toMatchSnapshot();
});
