import { join, sep } from 'node:path/posix';

import chalk from 'chalk';
import { Command } from 'commander';

export const downloadCommand = new Command('download')
  .alias('dl')
  .description('download remote file')
  .argument('[remote]', 'remote path', sep)
  .argument('[local]', 'local path', '.')
  .option('-t --token <token>', 'access token', '')
  .action(async (remote, local, options, { pcs }) => {
    try {
      const { list } = await pcs.list(remote);

      // if (list.length === 0) {
      //   list.push({
      //     server_filename: remoteFilename,
      //     path: remoteFilename,
      //     isdir: 0,
      //   } as any);
      // }

      list.reduce(async (previousValue, currentValue) => {
        await previousValue;
        const localFilename = join(local, pcs.normalize(currentValue.path));

        if (currentValue.isdir === 1) {
          return Promise.resolve();
        }

        console.log(`${chalk.blueBright('==>')} Downloading ${chalk.green(localFilename)}`);
        return pcs.download(currentValue.path, localFilename) as unknown;
      }, Promise.resolve());

      // todo
    } catch (err: unknown) {
      const { response: { data } } = err;
      console.log(chalk.red(`error code ${data.error_code || data.statusCode} : ${data.error_msg || data.statusMessage}`));
    }
  });
