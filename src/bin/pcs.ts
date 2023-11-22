#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Command } from 'commander';
import chalk from 'chalk';
import { name, version } from '../../package.json';
import {
  CREATE_APP_URL, APP_LIST_URL, log, fileJSON,
} from '@/utils';

import init from '@/command/init';
import upload from '@/command/upload';
import refresh from '@/command/refresh';
import quota from '@/command/quota';
import meta from '@/command/meta';
import list from '@/command/list';
import download from '@/command/download';
import rm from '@/command/delete';
import fetch from '@/command/fetch';

const program = new Command();

program
  .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${chalk.blue.underline(CREATE_APP_URL)}.\nIf you have already created an app, you can visit ${chalk.blue.underline(APP_LIST_URL)} and get it in your app's info.`)
  .version(version);

program.hook('preAction', (thisCommand, actionCommand) => {
  const tokenOption = actionCommand.options.find((option) => { return option.long === '--token'; });
  if (tokenOption) {
    const tokenJson = fileJSON('TOKEN');
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    actionCommand.setOptionValue('token', tokenOption.defaultValue || tokenJson.access_token);
    ['key', 'secret', 'refresh_token'].map((item) => {
      return tokenJson[item] && actionCommand.setOptionValue(item, tokenJson[item]);
    });
  }
  // throw 'test';
});

init(program);
refresh(program);
quota(program);
meta(program);
list(program);
upload(program);
download(program);
rm(program);
fetch(program);

program.parse();
