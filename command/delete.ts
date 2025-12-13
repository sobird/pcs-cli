import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import prompts from 'prompts';
import PcsService from 'services/pcs';
import { log, toRemotePath } from 'utils';

export const deleteCommand = new Command('delete')
  .alias('rm')
  .description('delete remote file')
  .argument('<remote>', 'remote path')
  .option('-t --token [token]', 'access token')
  .action(async (remote, options) => {
    const remoteFilename = toRemotePath(remote);

    if (remoteFilename === toRemotePath('/')) {
      log('You are about to delete the root directory of the application, which will lose all data', chalk.red);
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to continue?',
        initial: false,
      });

      if (!confirm) {
        return;
      }
    }

    try {
      await PcsService.delete(remoteFilename, options.token as string);
    } catch (err: any) {
      const { response: { data } } = err;
      log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
    }
  });
