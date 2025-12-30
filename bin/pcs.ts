#!/usr/bin/env tsx

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import {
  CREATE_APP_URL, APP_LIST_URL, link,
} from 'utils';

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
} from '@/command';
import { PCSClient } from '@/services/pcs';
import { PCS_CONF } from '@/utils/constants';
import { readJSON } from '@/utils/json';

import { name, version } from '../package.json';

declare module '@commander-js/extra-typings' {
  interface Command {
    pcs: PCSClient;
  }
}

const program = new Command(name)
  // .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${(link(CREATE_APP_URL, CREATE_APP_URL))}.\nIf you have already created an app, you can visit ${chalk.blue.underline(APP_LIST_URL)} and get it in your app's info.`)
  .version(version)
  .hook('preAction', async (thisCommand, actionCommand) => {
    const actionCommandName = actionCommand.name();
    if (actionCommandName === 'init') {
      return;
    }

    try {
      const config = await readJSON(PCS_CONF);
      if (actionCommandName === 'refresh') {
        actionCommand.setOptionValue('key', actionCommand.getOptionValue('key') || config.key);
        actionCommand.setOptionValue('secret', actionCommand.getOptionValue('secret') || config.secret);
        actionCommand.setOptionValue('refreshToken', actionCommand.getOptionValue('refreshToken') || config.refresh_token);
      } else {
        // eslint-disable-next-line no-param-reassign
        actionCommand.pcs = new PCSClient(actionCommand.getOptionValue('name') || config.name, actionCommand.getOptionValue('token') || config.access_token);
      }
    } catch (err) {
      //
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

try {
  program.exitOverride();
  program.parse(process.argv);
} catch (err) {
  // custom processing...
}
