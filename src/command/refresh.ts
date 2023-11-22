import { type Command } from 'commander';
import chalk from 'chalk';
import { fileJSON, log } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('refresh')
    .description('refresh token.')
    .option('-t --token [token]', 'access token')
    .action(async (options) => {
      try {
        const res = await PcsService.refreshToken(options.key, options.secret, options.refresh_token);
        fileJSON('TOKEN', {
          ...res,
          key: options.key,
          secret: options.secret,
        });

        log('Successfully refreshed token', chalk.green);
      } catch (err: any) {
        const { response: { data } } = err;
        log(`OAuth error ${data.error} : ${data.error_description}`, chalk.red);
      }
    });
};
