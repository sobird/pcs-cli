import { isAxiosError } from 'axios';
import bytes from 'bytes';
import chalk from 'chalk';
import cliui from 'cliui';
import { Command } from 'commander';
import dayjs from 'dayjs';

export const listCommand = new Command('list')
  .description('list directory contents')
  .argument('[path]', 'path', '/')
  .alias('ll')
  .option('-t --token <token>', 'access token')
  .action(async (path, options, { pcs }) => {
    try {
      const ui = cliui({});

      console.log('pcs', pcs);

      const { list } = await pcs.list(path);

      list.map((item) => {
        const {

          server_mtime, size, server_filename, isdir,
        } = item;
        const filename = isdir === 1 ? chalk.blueBright(server_filename) : server_filename;

        ui.div({
          text: chalk.gray(dayjs.unix(server_mtime).format('YYYY/MM/DD HH:mm:ss')),
          width: 22,
          padding: [0, 0, 0, 0],
        }, {
          text: bytes(size) ?? '',
          width: 15,
          align: 'right',
          padding: [0, 2, 0, 0],
        }, {
          text: filename,
          padding: [0, 0, 0, 0],
        });

        return item;
      });

      console.log(ui.toString());
    } catch (error) {
      if (isAxiosError<{ error_code: string; error_msg: string }>(error)) {
        const { response: { data } = {} } = error;
        console.log(chalk.red(`error code ${data?.error_code} : ${data?.error_msg}`));
      }
    }
  });
