import { type Command } from 'commander';
import { sep } from 'path';
import chalk from 'chalk';
import dayjs from 'dayjs';
import bytes from 'bytes';
import cliui from 'cliui';
import { log, toRemotePath } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('list')
    .description('list directory contents.')
    .argument('[path]', 'path', sep)
    .alias('ll')
    .option('-t --token [token]', 'access token')
    .action(async (path, options) => {
      try {
        const ui = cliui({} as any);

        const { list } = await PcsService.listFile(options.token, toRemotePath(path));
        list.map(item => {
          const {server_mtime, size, server_filename, isdir} = item;
          const filename = isdir === 1 ? chalk.blueBright(server_filename) : server_filename;

          ui.div({
            text: chalk.gray(dayjs.unix(server_mtime).format('YYYY/MM/DD HH:mm:ss')),
            width: 22,
            padding: [0, 0, 0, 0]
          }, {
            text: bytes(size),
            width: 15,
            align: 'right',
            padding: [0, 2, 0, 0]
          }, {
            text: filename,
            padding: [0, 0, 0, 0]
          });

          return item;
        });

        console.log(ui.toString());
      } catch (err: any) {
        const { response: { data } } = err;
        log(`error code ${data.error_code} : ${data.error_msg}`, chalk.red);
        return;
      }
    });
};
