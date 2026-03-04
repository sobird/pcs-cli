import { sep } from 'node:path';

import { isAxiosError } from 'axios';
import chalk from 'chalk';
import { Command } from 'commander';

export const fetchCommand = new Command('fetch')
  .description('offline download')
  .argument('[url]', 'url', sep)
  .argument('[remote]', 'remote path', '.')
  .option('-t --token <token>', 'access token')
  .action(async (source, remote, options, { pcs }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      await pcs.fetch(source, remote);
    } catch (error) {
      if (isAxiosError<{ error_code: string; error_msg: string }>(error)) {
        const { response: { data } = {} } = error;
        console.log(chalk.red(`error code ${data?.error_code} : ${data?.error_msg}`));
      }
    }
  });
