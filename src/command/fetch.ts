import { sep } from 'node:path';

import chalk from 'chalk';
import { Command } from 'commander';

export const fetchCommand = new Command('fetch')
  .description('offline download')
  .argument('[url]', 'url', sep)
  .argument('[remote]', 'remote path', '.')
  .option('-t --token <token>', 'access token', '')
  .action(async (source, remote, options, { pcs }) => {
    try {
      await pcs.fetch(source, remote);
    } catch (err: unknown) {
      const { response: { data } } = err;
      console.log(chalk.red(`error code ${data.error_code} : ${data.error_msg}`));
    }
  });
