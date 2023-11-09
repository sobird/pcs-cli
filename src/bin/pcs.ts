#!/usr/bin/env node

import fs from 'fs';
import { resolve, dirname } from 'path';
import { Command, Option } from 'commander';
import prompts, { PromptObject } from 'prompts';
import osenv from 'osenv';
import open from 'open';
import { name, version } from '../../package.json';
import PcsService from '@/services/pcs';

const program = new Command();
const tmp = resolve(osenv.home(), '.' + name);
const pcs = resolve(tmp, 'pcs');
const pcsConfFile = resolve(pcs, 'conf');
const accessTokenFile = resolve(pcs, 'access_token');
const refreshTokenFile = resolve(pcs, 'refresh_token');

program
  .name('pcs')
  .description('Baidu Personal Cloud Storage Scaffold.\nYou can get app key by visiting https://pan.baidu.com/union/console/createapp.\nIf you have already created an app, you can visit https://pan.baidu.com/union/console/applist and get it in your app\'s info')
  .version(version);

program.command('init')
  .description('Initialize Baidu Personal Cloud Storage')
  .option('-n, --name <string>', 'app name')
  .option('-k, --key <string>', 'app key')
  .option('-s, --secret <string>', 'app secret')
  .action(async (options) => {
    const asks: PromptObject[] = [];
    ['name', 'key', 'secret'].map(item => {
      if (!options[item]) {
        asks.push({
          type: 'text',
          name: item,
          message: `Please enter baidu app ${item}`
        });
      }
    });
    const asksRes = await prompts(asks);
    const pcsInfo = {
      ...options,
      ...asksRes
    };

    if (!['name', 'key', 'secret'].every(item => pcsInfo[item])) {
      return;
    }

    let confirm = true;

    // 如果存在则提示 是否覆盖
    if (fs.existsSync(pcsConfFile)) {
      const { value } = await prompts({
        type: "confirm",
        name: 'value',
        message: 'Baidu pcs initialization will be begin. If you have already configured before, your old settings will be overwritten. Can you confirm?',
        initial: false
      });
      confirm = value;
    }

    if (!confirm) {
      return;
    }

    // 写入pcs配置
    writeFileSync(pcsConfFile, JSON.stringify(pcsInfo));

    try {
      const {verification_url, user_code} = await PcsService.oauthDevice(pcsInfo.key);
      await open(verification_url);
      const { value } = await prompts({
        type: "confirm",
        name: 'value',
        message: `Launch your favorite web browser and visit ${verification_url}.\nInput ${user_code} as the user code if asked.\nAfter granting access to the application, come back here and press Enter to continue.`,
        initial: false
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`OAuth error ${data.error} : ${data.error_description}`);
      return;
    }

  });


program.parse();

// mkdirp
function writeFileSync(path: string, contents: string) {
  fs.mkdirSync(dirname(path), { recursive: true });
  fs.writeFileSync(path, contents);
}
