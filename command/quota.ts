import { Command } from '@commander-js/extra-typings';
import bytes from 'bytes';
import chalk from 'chalk';
import Progress from 'progress';

export const quotaCommand = new Command('quota')
  .description('check your pcs status')
  .option('-t --token [token]', 'access token')
  .action(async (options, { pcs }) => {
    try {
      const { quota, used } = await pcs.quota();
      const bar = new Progress(':bar :used/:quota :percent', {
        complete: '█',
        incomplete: chalk.green('░'),
        width: 30,
        total: quota,
      });
      bar.tick(used, {
        used: bytes(used),
        quota: bytes(quota),
      });
      console.log('');
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(chalk.red`error code ${data.error_code} : ${data.error_msg}`);
    }
  });
