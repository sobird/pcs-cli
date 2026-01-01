import { sep } from 'path';

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';

export const fetchCommand = new Command('fetch')
  .description('fetch source to remote')
  .argument('[source]', 'source path', sep)
  .argument('[remote]', 'remote path', '.')
  .option('-t --token <token>', 'access token', '')
  .action(async (source, remote, options, { pcs }) => {
    try {
      await pcs.fetch(source, remote);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(chalk.red(`error code ${data.error_code} : ${data.error_msg}`));
    }
  });
