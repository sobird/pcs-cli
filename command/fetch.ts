import { sep } from 'path';

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import PcsService from 'services/pcs';

import { log, toRemotePath } from '@/utils';

export const fetchCommand = new Command('fetch')
  .description('fetch source to remote')
  .argument('[source]', 'source path', sep)
  .argument('[remote]', 'remote path', '.')
  .option('-t --token [token]', 'access token')
  .action(async (source, remote, options) => {
    const remoteFilename = toRemotePath(remote);

    try {
      await PcsService.fetch(source, remoteFilename, options.token as string);
    } catch (err: any) {
      const {
        response: { data },
      } = err;
      log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
    }
  });
