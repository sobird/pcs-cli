import { Command } from '@commander-js/extra-typings';
import bytes from 'bytes';
import chalk from 'chalk';
import Progress from 'progress';
import PcsService from 'services/pcs';
import { log } from 'utils';

export const quotaCommand = new Command('quota')
  .description('check your pcs status')
  .option('-t --token [token]', 'access token')
  .action(async (options) => {
    try {
      const { quota, used } = await PcsService.quotaInfo(options.token as string);
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
      log('');
    } catch (err: any) {
      const { response: { data } } = err;
      log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
    }
  });
