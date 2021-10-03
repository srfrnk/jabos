import child_process from 'child_process';

export default async (command: string, options?: any): Promise<{ exitCode: number, stdout: string, stderr: string }> => {
  return new Promise((resolve, reject) => {
    var stdout = '';
    var stderr = '';
    var proc = child_process.exec(command, options);
    proc.stdout.on('data', (data) => { stdout += data; })
    proc.stderr.on('data', (data) => { stderr += data; })
    proc.on('close', (exitCode) => resolve({
      exitCode, stdout, stderr
    }));
  });
};
