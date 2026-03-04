import { isAxiosError } from 'axios';
import chalk from 'chalk';
import { Command } from 'commander';

export const metaCommand = new Command('meta')
  .description('get path meta')
  .argument('[path]', 'meta path', '/')
  .option('-t --token [token]', 'access token')
  .action(async (path, options, { pcs }) => {
    try {
      const { list } = await pcs.meta(path);
      console.log(list[0]);
    } catch (error) {
      if (isAxiosError<{ error_code: string; error_msg: string }>(error)) {
        const { response: { data } = {} } = error;
        console.log(chalk.red(`error code ${data?.error_code} : ${data?.error_msg}`));
      }
    }
  });
