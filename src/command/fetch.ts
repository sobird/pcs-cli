import { type Command } from 'commander';
import { sep } from 'path';
import chalk from 'chalk';
import { log, toRemotePath } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program
    .command('fetch')
    .description('fetch source to remote')
    .argument('[source]', 'source path', sep)
    .argument('[remote]', 'remote path', '.')
    .option('-t --token [token]', 'access token')
    .action(async (source, remote, options) => {
      const remoteFilename = toRemotePath(remote);

      try {
        await PcsService.fetch(options.token, source, remoteFilename);
      } catch (err: any) {
        const {
          response: { data },
        } = err;
        log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
      }
    });
};
