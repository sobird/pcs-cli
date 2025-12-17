#!/usr/bin/env tsx

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import {
  CREATE_APP_URL, APP_LIST_URL, log, fileJSON, link,
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
import { name, version } from '@/package.json' with { type: 'json' };

const program = new Command();

program
  .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${(link(CREATE_APP_URL, CREATE_APP_URL))}.\nIf you have already created an app, you can visit ${chalk.blue.underline(APP_LIST_URL)} and get it in your app's info.`)
  .version(version);

// 获取APP在本地存储的token信息
program.hook('preAction', (command, actionCommand) => {
  const tokenOption = actionCommand.options.find((option) => { return option.long === '--token'; });
  if (tokenOption) {
    const tokenJson = fileJSON('TOKEN');
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      process.exit(1);
    }

    actionCommand.setOptionValue('token', tokenOption.defaultValue || tokenJson.access_token);
    ['key', 'secret', 'refresh_token'].map((item) => {
      return tokenJson[item] && actionCommand.setOptionValue(item, tokenJson[item]);
    });
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
