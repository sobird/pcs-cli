import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';

export const metaCommand = new Command('meta')
  .description('get path meta')
  .argument('[path]', 'meta path', '/')
  .option('-t --token [token]', 'access token')
  .action(async (path, options, { pcs }) => {
    try {
      const { list } = await pcs.meta(path);
      console.log(list[0]);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(chalk.red(`error code ${data.error_code}: ${data.error_msg}`));
    }
  });
