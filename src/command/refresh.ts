import { isAxiosError } from 'axios';
import chalk from 'chalk';
import { Command } from 'commander';

import { DeviceCodeGrant } from '../services/auth';
import { PCS_CONF } from '../utils/constants';
import { writeJSON } from '../utils/json';

export const refreshCommand = new Command('refresh')
  .description('refresh token')
  .option('-k, --key <string>', 'app key', '')
  .option('-s, --secret <string>', 'app secret', '')
  .option('-t --refresh-token <refresh token>', 'refresh token')
  .action(async (options) => {
    const oauth = new DeviceCodeGrant({
      client_id: options.key,
      client_secret: options.secret,
    });

    try {
      const refreshToken = await oauth.refreshToken(options.refreshToken ?? '');

      // 保存配置
      await writeJSON(PCS_CONF, { ...options, ...refreshToken });

      console.log(chalk.green('Successfully refreshed token'));
    } catch (error) {
      if (isAxiosError<{ error_code: string; error_msg: string }>(error)) {
        const { response: { data } = {} } = error;
        console.log(chalk.red(`error code ${data?.error_code} : ${data?.error_msg}`));
      }
    }
  });
