/* eslint-disable max-len */
import os from 'os';
import { statSync } from 'fs';
import { join, sep } from 'path';
import { glob } from 'glob';
import { type Command } from 'commander';
import chalk from 'chalk';
import { log, toRemotePath, splitFile } from 'utils';
import PcsService from 'services/pcs';

export default (program: Command) => {
  program.command('upload')
    .description('upload local file')
    .argument('[pattern]', 'glob pattern', '*')
    .argument('[remote]', 'remote path', sep)
    .option('-t --token [token]', 'access token')
    .option('-b --bytes [size]', 'Split upload bytes size')
    .option('--thread', 'Thread')
    .action(async (pattern, remote, options) => {
      const files = await glob(pattern, {
        nodir: true,
      });
      const bytes = options.bytes === true ? 1073741824 : parseInt(options.bytes, 10);
      const temp = join(os.tmpdir(), 'pcs-cli');
      try {
        // 串行上传
        files.reduce(async (previousValue, currentValue) => {
          await previousValue;
          const fileStat = statSync(currentValue);

          if (Number.isInteger(bytes) && fileStat.size > bytes) {
            // 分片上传
            const pieces = await splitFile(currentValue, bytes, temp);
            const blocks = [];

            // eslint-disable-next-line no-restricted-syntax
            for (const piece of pieces as string[]) {
              //
              // eslint-disable-next-line no-await-in-loop
              const { md5 } = await PcsService.upload2(options.token, piece, '', 'overwrite', 'tmpfile') as any;
              blocks.push(md5);
            }
            const param = {
              block_list: blocks,
            };
            return PcsService.createSuperFile(options.token, toRemotePath(join(remote, currentValue)), param) as unknown as Promise<void>;
          }
          log(`${chalk.blueBright('==>')} Uploading ${currentValue}`);
          return PcsService.upload2(options.token, currentValue, toRemotePath(join(remote, currentValue))) as Promise<void>;
        }, Promise.resolve());

      // todo
      } catch (err: any) {
        const { response: { data } } = err;
        console.log(`error code ${data.error_code} : ${data.error_msg}`);
      }
    });
};
