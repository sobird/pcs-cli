#!/usr/bin/env node

import fs from 'fs';
import {resolve, dirname} from 'path';
import { Command, Option } from 'commander';
import prompts, { PromptObject } from 'prompts';
import osenv from 'osenv';
import { name, version } from '../../package.json';

const program = new Command();
const tmp = resolve(osenv.home(), '.' + name);
const pcsConfFile = resolve(tmp, 'pcs');

console.log('pcsConfFile', pcsConfFile);

program
  .name('pcs')
  .description('Baidu Personal Cloud Storage Scaffold')
  .version(version);

program.command('init')
  .description('Initialize Baidu Personal Cloud Storage')
  .option('-n, --name <string>', 'app name')
  .option('-k, --key <string>', 'app key')
  .option('-s, --secret <string>', 'app secret')
  .action(async (options) => {
    const asks: PromptObject[] = [];
    ['name', 'key', 'secret'].map(item => {
      if(!options[item]) {
        asks.push({
          type: 'text',
          name: item,
          message: `Please enter baidu app ${item}`
        });
      }
    });
    const res = await prompts(asks);
    const pcsInfo = {
      ...options,
      ...res
    };

    if(!['name', 'key', 'secret'].every(item => pcsInfo[item])) {
      return;
    }

    let confirm = true;

    // 如果存在则提示 是否覆盖
    if(fs.existsSync(pcsConfFile)) {
      const {value} = await prompts({
        type: "confirm",
        name: 'value',
        message: 'Baidu pcs initialization will be begin. If you have already configured before, your old settings will be overwritten. Can you confirm?',
        initial: false
      });
      confirm = value;
    }

    if(!confirm) {
      return;
    }

    // 写入pcs配置
    writeFileSync(pcsConfFile, JSON.stringify(pcsInfo));
  });


program.parse();

// mkdirp
function writeFileSync(path: string, contents: string) {
  fs.mkdirSync(dirname(path), { recursive: true });
  fs.writeFileSync(path, contents);
}
