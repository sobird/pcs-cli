import { Command } from '@commander-js/extra-typings';
import bytes from 'bytes';
import chalk from 'chalk';
import cliui from 'cliui';
import dayjs from 'dayjs';

export const listCommand = new Command('list')
  .description('list directory contents')
  .argument('[path]', 'path', '/')
  .alias('ll')
  .option('-t --token <token>', 'access token', '')
  .action(async (path, options, command) => {
    const { pcs } = command;

    try {
      const ui = cliui({} as any);

      const { list } = await pcs.list(path);

      list.map((item) => {
        const {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          server_mtime, size, server_filename, isdir,
        } = item;
        const filename = isdir === 1 ? chalk.blueBright(server_filename) : server_filename;

        ui.div({
          text: chalk.gray(dayjs.unix(server_mtime).format('YYYY/MM/DD HH:mm:ss')),
          width: 22,
          padding: [0, 0, 0, 0],
        }, {
          text: bytes(size) as string,
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
    } catch (err: any) {
      const { response: { data } } = err;
      console.error(chalk.red(`error code ${data.error_code} : ${data.error_msg}`));
    }
  });
