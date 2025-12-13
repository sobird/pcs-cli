import { join, sep } from 'path';

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import PcsService from 'services/pcs';
import { log, toLocalPath, toRemotePath } from 'utils';

export const downloadCommand = new Command('download')
  .alias('dl')
  .description('download remote file')
  .argument('[remote]', 'remote path', sep)
  .argument('[local]', 'local path', '.')
  .option('-t --token [token]', 'access token')
  .action(async (remote, local, options) => {
    const remoteFilename = toRemotePath(remote);

    try {
      const { list } = await PcsService.listFile(options.token as string, remoteFilename);

      if (list.length === 0) {
        list.push({
          server_filename: remoteFilename,
          path: remoteFilename,
          isdir: 0,
        } as any);
      }

      list.reduce(async (previousValue, currentValue) => {
        await previousValue;
        const localFilename = join(local, toLocalPath(currentValue.path));

        if (currentValue.isdir === 1) {
          return Promise.resolve();
        }

        log(`${chalk.blueBright('==>')} Downloading ${chalk.green(localFilename)}`);
        return PcsService.download(options.token as string, currentValue.path, localFilename) as any;
      }, Promise.resolve());
      // todo
    } catch (err: any) {
      const { response: { data } } = err;
      log(`error code ${data.error_code || data.statusCode} : ${data.error_msg || data.statusMessage}`, chalk.red);
    }
  });
