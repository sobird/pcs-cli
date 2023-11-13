#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import { resolve, dirname, join } from 'path';
import { Command, Option } from 'commander';
import prompts, { PromptObject } from 'prompts';
// todo remove
import osenv from 'osenv';
import open from 'open';
import chalk from 'chalk';
import dayjs from 'dayjs';
import Progress from 'progress';
import bytes from 'bytes';
import { fileJSON } from '@/utils';

import { name, version } from '../../package.json';
import PcsService from '@/services/pcs';

const program = new Command();

const tmp = resolve(osenv.home(), '.' + name);
const pcsappFile = resolve(tmp, 'pcsapp');
const deviceFile = resolve(tmp, 'device');
const tokenFile = resolve(tmp, 'token');
const defaultExpiresIn = 2592000; // 单位s
const createAppUrl = 'https://pan.baidu.com/union/console/createapp';
const appListUrl = 'https://pan.baidu.com/union/console/applist';

import init from '@/command/init';
import upload from '@/command/upload';
import refresh from '@/command/refresh';
import quota from '@/command/quota';
import meta from '@/command/meta';
import list from '@/command/list';

program
  .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${chalk.blue.underline(createAppUrl)}.\nIf you have already created an app, you can visit ${chalk.blue.underline(appListUrl)} and get it in your app's info.`)
  .version(version);

program.hook('preAction', (thisCommand, actionCommand) => {
  const tokenOption = actionCommand.options.find(option => option.long === '--token');
  if(tokenOption) {
    const tokenJson = fileJSON('TOKEN');
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    actionCommand.setOptionValue('token', tokenOption.defaultValue || tokenJson.access_token);
    ['key', 'secret', 'refresh_token'].map(item => {
      tokenJson[item] && actionCommand.setOptionValue(item, tokenJson[item]);
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

program.command('download [remote] [local]')
  .description('download remote file.')
  .alias('dl')
  .action(async (source, destination,) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    const localFilename = resolve(destination, toLocalPath(source));
    const remoteFilename = toRemotePath(source);

    try {
      await PcsService.download(tokenJson.access_token, remoteFilename, localFilename);
      // todo 
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });

program.command('delete [remote]')
  .alias('rm')
  .description('delete remote file.')
  .action(async (remote) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    const remoteFilename = toRemotePath(remote);

    try {
      await PcsService.delete(tokenJson.access_token, remoteFilename,);
      // todo 
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });

program.command('fetch [source] [remote]')
  .description('fetch source to remote.')
  .action(async (source, remote) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    const remoteFilename = toRemotePath(remote);

    try {
      await PcsService.fetch(tokenJson.access_token, source, remoteFilename);
      // todo 
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });
  
program.parse();

// utils

// mkdirp
function writeJsonSync(path: string, contents: object) {
  fs.mkdirSync(dirname(path), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(contents));
}

function readJsonSync(path: string) {
  if (!fs.existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (err) {
    return null;
  }
}

/** 读取未过期的信息 过期则返回null */
function readUnexpiredJsonSync(path: string, expiresField = 'expires_in') {
  const info = readJsonSync(path);
  if (!info) {
    return null;
  }
  const expiresInfo = info[expiresField];
  // 如果不存在 expiresField 则认为长期有效
  if (!expiresInfo) {
    return info;
  }

  const { mtimeMs } = fs.statSync(path);
  const expireSecond = (Date.now() - mtimeMs) / 1000;

  if (expireSecond > expiresInfo) {
    return null;
  }

  const expiresTime = mtimeMs + expiresInfo * 1000;
  info.expires_time = expiresTime;
  return info;
}

function log(message: string, color = chalk.blackBright) {
  console.log(color(message));
}

function toRemotePath(path: string) {
  const pcsappInfo = readUnexpiredJsonSync(pcsappFile);
  return join('/apps', pcsappInfo.name, path);
}

function toLocalPath(path: string) {
  const pcsappInfo = readUnexpiredJsonSync(pcsappFile);
  const pathPrefix = join('/apps', pcsappInfo.name);
  if (path.indexOf(pathPrefix) === 0) {
    return path.substring(pathPrefix.length, path.length);
  }
  else {
    return path;
  }
}