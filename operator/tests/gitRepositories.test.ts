import { Request, Response } from 'express';
import mockResponse from './mockResponse';
import gitRepositories from '../gitRepositories';
import { setMock, clearMock } from './settingsMock';

beforeEach(() => {
  setMock();
});

afterEach(() => {
  clearMock();
});

test('gitRepositories sync', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'name_value',
          uid: 'uid_value',
          namespace: 'namespace_value'
        },
        spec: {
          url: 'url_value',
          branch: 'branch_value'
        },
        status: {
          lastCommit: 'lastCommit_value'
        }
      },
    }
  } as unknown as Request;
  const res = mockResponse();
  await gitRepositories.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('gitRepositories sync with promotedCommit', async () => {
  const req = {
    body: {
      object: {
        metadata: {
          name: 'name_value',
          namespace: 'namespace_value'
        },
        spec: {
          promotedCommit: 'promotedCommit_value'
        }
      },
    }
  } as unknown as Request;
  const res = mockResponse();
  await gitRepositories.sync(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('gitRepositories customize', async () => {
  const req = {} as unknown as Request;
  const res = mockResponse();
  await gitRepositories.customize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('gitRepositories finalize', async () => {
  const req = {} as unknown as Request;
  const res = mockResponse();
  await gitRepositories.finalize(req, res as unknown as Response, () => { /* NOOP */ });
  expect(res.json.mock.calls[0]).toMatchSnapshot();
  expect(res.status).toHaveBeenCalledWith(200);
});
