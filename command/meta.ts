import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import PcsService from 'services/pcs';
import { log, toRemotePath } from 'utils';

export const metaCommand = new Command('meta')
  .description('get path meta')
  .argument('[path]', 'meta path', '/')
  .option('-t --token [token]', 'access token')
  .action(async (path, options) => {
    console.log('path', path);
    try {
      const { list } = await PcsService.getMeta(toRemotePath(path), options.token as string);
      console.log(list[0]);
    } catch (err: any) {
      console.log('err', err);
      const { response: { data } } = err;
      log(`error code ${data.error_code}: ${data.error_msg}`, chalk.red);
    }
  });
