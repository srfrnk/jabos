import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import exec from './exec';

export default {
  async sync(request: Request, response: Response, next: NextFunction) {
    console.log("gitRepositories sync req", JSON.stringify(request.body));

    var repo = request.body.object.spec;

    var dir = fs.mkdtempSync('/tempGit/');
    await exec(`git clone --bare --single-branch --depth 1 --branch ${repo.branch} ${repo.url} ${dir}`);
    var { stdout: latestCommit } = await exec('git log -n 1 --pretty=format:"%H" | head -n 1', {
      cwd: dir
    });
    fs.rmdirSync(dir, { recursive: true });

    var res = {
      "annotations": {
        "lastUpdate": new Date().toISOString(),
        "latestCommit": latestCommit,
      },
    };

    console.log("gitRepositories sync res", JSON.stringify(res));
    response.status(200).json(res);
  },

  async customize(request: Request, response: Response, next: NextFunction) {
    console.log("gitRepositories customize req", JSON.stringify(request.body));

    var res = {
      "relatedResources": []
    };

    console.log("gitRepositories customize res", JSON.stringify(res));
    response.status(200).json(res);
  }
}
