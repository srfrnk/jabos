const child_process = require('child_process');
import exec from '../exec';

test('exec', async () => {
  jest.mock('child_process');
  child_process.exec = jest.fn(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn((evt, close) => { close(); }),
  }));

  const command = 'command_value';
  const options = { option1: 'value' };
  await exec(command, options);
  expect(child_process.exec).toHaveBeenCalledWith(command, options);
});
