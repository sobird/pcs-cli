import { Command } from '@commander-js/extra-typings';
import axios from 'axios';
import chalk from 'chalk';
import PcsService from 'services/pcs';
import { fileJSON, log } from 'utils';

export const refreshCommand = new Command('refresh')
  .description('refresh token')
  .option('-k, --key <string>', 'app key')
  .option('-s, --secret <string>', 'app secret')
  .option('-t --refresh-token [refresh token]', 'refresh token')
  .action(async (options) => {
    console.log('options', options);

    const res33 = axios.get('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id: options.key,
        client_secret: options.secret,
        refresh_token: options.refreshToken,
        grant_type: 'refresh_token',
      },
    });
    console.log('res33', res33);
    return;

    try {
      const res = await PcsService.refreshToken(options.key as string, options.secret as string, options.refreshToken as string);
      fileJSON('TOKEN', {
        ...res,
        key: options.key,
        secret: options.secret,
      });

      log('Successfully refreshed token', chalk.green);
    } catch (err: any) {
      console.log('err', err);
      const { response: { data } } = err;
      log(`OAuth error ${data.error} : ${data.error_description}`, chalk.red);
    }
  });
