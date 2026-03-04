import chalk from 'chalk';
import { Command } from 'commander';

import {
  initCommand,
  deleteCommand,
  downloadCommand,
  fetchCommand,
  listCommand,
  metaCommand,
  quotaCommand,
  refreshCommand,
  uploadCommand,
} from './command';
import { name, version } from '../package.json';
import { PCSClient } from './services/pcs';
import { link } from './utils';
import { PCS_CONF, CREATE_APP_URL, APP_LIST_URL } from './utils/constants';
import { readJSON } from './utils/json';

declare module 'commander' {
  interface Command {
    pcs: PCSClient;
  }
}

const program = new Command(name)

  // .name(name)
  .description(`${chalk.bold('Baidu Personal Cloud Storage Scaffold')}.\n\nYou can get app key by visit ${chalk.blue.underline(link(CREATE_APP_URL, CREATE_APP_URL))}.\nIf you have already created an app, you can visit ${chalk.blue.underline(link(APP_LIST_URL, APP_LIST_URL))} and get it in your app's info.`)
  .version(version)
  .hook('preAction', async (thisCommand, actionCommand) => {
    const actionCommandName = actionCommand.name();
    if (actionCommandName === 'init') {
      return;
    }

    try {
      const config = await readJSON<
      { key: string;
        name: string;
        secret: string;
        access_token: string;
        refresh_token: string; }>(PCS_CONF);
      if (actionCommandName === 'refresh') {
        actionCommand.setOptionValue('key', actionCommand.getOptionValue('key') ?? config.key);
        actionCommand.setOptionValue('secret', actionCommand.getOptionValue('secret') ?? config.secret);
        actionCommand.setOptionValue('refreshToken', actionCommand.getOptionValue('refreshToken') ?? config.refresh_token);
      } else {
        actionCommand.pcs = new PCSClient(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          (actionCommand.getOptionValue('name') as string | undefined) ?? config.name,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          (actionCommand.getOptionValue('token') as string | undefined) ?? config.access_token,
        );
      }
    } catch (err) {
      throw new Error(chalk.redBright('Please use the "pcs init" command to initialize'), { cause: err });
    }
  });

program
  .addCommand(initCommand)
  .addCommand(listCommand)
  .addCommand(metaCommand)
  .addCommand(quotaCommand)
  .addCommand(fetchCommand)
  .addCommand(deleteCommand)
  .addCommand(uploadCommand)
  .addCommand(refreshCommand)
  .addCommand(downloadCommand);

program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  // console.log((error as Error).message);
}
