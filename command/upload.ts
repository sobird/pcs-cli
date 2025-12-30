import { statSync } from 'fs';
import os from 'os';
import { join, sep } from 'path';

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { glob } from 'glob';

import { splitFile } from '@/utils';

export const uploadCommand = new Command('upload')
  .description('upload local file')
  .argument('[pattern]', 'glob pattern', '*')
  .argument('[remote]', 'remote path', sep)
  .option('-t --token [token]', 'access token')
  .option('-b --bytes <number>', 'Split upload bytes size', Number, 1073741824)
  .option('--thread', 'Thread')
  .action(async (pattern, remote, options, command) => {
    const { pcs } = command;

    const files = await glob(pattern, {
      nodir: true,
    });
    const { bytes } = options;

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
            const { md5 } = await pcs.upload(piece, '', 'overwrite', 'tmpfile') as any;
            blocks.push(md5);
          }
          const param = {
            block_list: blocks,
          };
          return pcs.createSuperFile(join(remote, currentValue), param) as unknown as Promise<void>;
        }
        console.log(`${chalk.blueBright('==>')} Uploading ${currentValue}`);
        return pcs.upload(currentValue, join(remote, currentValue)) as Promise<void>;
      }, Promise.resolve());

      // todo
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
    }
  });
