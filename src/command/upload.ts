import { join, sep } from 'path';
import { glob } from 'glob';
import { type Command } from 'commander';
import chalk from 'chalk';
import { fileJSON, log, toRemotePath } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('upload')
    .description('upload local file.')
    .argument('[pattern]', 'glob pattern', '*')
    .argument('[remote]', 'remote path', sep)
    .option('-t --token [token]', 'access token')
    .option('-b --bytes [size]', 'Split upload bytes size', '1073741824')
    .option('--thread', 'Thread')
    .action(async (pattern, remote, options) => {
      const files = await glob(pattern);

      try {
        // 串行上传
        files.reduce(async (prePromise, file) => {
          await prePromise;
          return PcsService.upload2(options.token, file, toRemotePath(join(remote, file))) as Promise<void>;
        }, Promise.resolve());
        
      // todo 
      } catch (err: any) {
        const { response: { data } } = err;
        console.log(`error code ${data.error_code} : ${data.error_msg}`);
        return;
      }
    });
};
