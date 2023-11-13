import { type Command } from 'commander';
import { sep } from 'path';
import chalk from 'chalk';
import { log, toRemotePath } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('meta')
    .description('get path meta.')
    .argument('[path]', 'meta path', sep)
    .option('-t --token [token]', 'access token')
    .action(async (path, options) => {
      try {
        const { list } = await PcsService.getMeta(options.token, toRemotePath(path)) as any;
        console.log(list[0]);
      } catch (err: any) {
        const { response: { data } } = err;
        log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
        return;
      }
    });
};
