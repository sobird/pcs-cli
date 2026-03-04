import { isAxiosError } from 'axios';
import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

export const deleteCommand = new Command('delete')
  .alias('rm')
  .description('delete remote file')
  .argument('<remote>', 'remote path')
  .option('-t --token <token>', 'access token')
  .action(async (remote, options, { pcs }) => {
    if (pcs.resolve(remote) === pcs.resolve('/')) {
      console.log(chalk.redBright('You are about to delete the root directory of the application, which will lose all data'));
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to continue?',
        initial: false,
      }) as { confirm: boolean };

      if (!confirm) {
        return;
      }
    }

    try {
      await pcs['delete'](remote);
    } catch (error) {
      if (isAxiosError<{ error_code: string; error_msg: string }>(error)) {
        const { response: { data } = {} } = error;
        console.log(chalk.red(`error code ${data?.error_code} : ${data?.error_msg}`));
      }
    }
  });
