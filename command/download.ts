import { join, sep } from 'node:path/posix';

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';

export const downloadCommand = new Command('download')
  .alias('dl')
  .description('download remote file')
  .argument('[remote]', 'remote path', sep)
  .argument('[local]', 'local path', '.')
  .option('-t --token <token>', 'access token', '')
  .action(async (remote, local, options, command) => {
    const { pcs } = command;

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
        return pcs.download(currentValue.path, localFilename) as any;
      }, Promise.resolve());
      // todo
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(chalk.red(`error code ${data.error_code || data.statusCode} : ${data.error_msg || data.statusMessage}`));
    }
  });
