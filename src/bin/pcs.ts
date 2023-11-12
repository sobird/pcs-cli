#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import { resolve, dirname, join } from 'path';
import { Command } from 'commander';
import prompts, { PromptObject } from 'prompts';
import osenv from 'osenv';
import open from 'open';
import chalk from 'chalk';
import dayjs from 'dayjs';
import Progress from 'progress';
import bytes from 'bytes';

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

program
  .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${chalk.blue.underline(createAppUrl)}.\nIf you have already created an app, you can visit ${chalk.blue.underline(appListUrl)} and get it in your app's info.`)
  .version(version);

init(program);

program.command('refresh')
  .description('refresh token.')
  .action(async () => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    try {
      const res = await PcsService.refreshToken(tokenJson.key, tokenJson.secret, tokenJson.refresh_token);
      writeJsonSync(tokenFile, {
        ...res,
        key: tokenJson.key,
        secret: tokenJson.secret
      });
      log('Successfully refreshed token', chalk.green);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`OAuth error ${data.error} : ${data.error_description}`);
      return;
    }
  });

program.command('quota')
  .description('Check Your Cloud Storage Status.')
  .action(async () => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    try {
      const { quota, used } = await PcsService.quotaInfo(tokenJson.access_token);
      const bar = new Progress(':bar :aaa/:bbb :percent', {
        complete: '█',
        incomplete: '░',
        width: 30,
        total: quota
      });
      bar.tick(used, {
        "aaa": bytes(used),
        "bbb": bytes(quota)
      });
      console.log('');
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });

program.command('meta')
  .description('Get Path Meta.')
  .argument('<path>', 'meta path')
  .action(async (path) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    try {
      const res = await PcsService.getMeta(tokenJson.access_token, toRemotePath(path));
      console.log('res', res);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });

program.command('list')
  .description('list directory contents.')
  .argument('<path>', 'path')
  .alias('ls')
  .action(async (path) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    try {
      const { list } = await PcsService.listFile(tokenJson.access_token, toRemotePath(path));
      list.map(item => {
        console.log(dayjs.unix(item.server_mtime).format('YYYY-MM-DD HH:mm:ss'), item.server_filename);
        return item;
      });
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`error code ${data.error_code} : ${data.error_msg}`);
      return;
    }
  });

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

program.command('upload [local] [remote]')
  .description('upload local file.')
  .option('-b --bytes <size>', 'Split upload bytes size', '1073741824')
  .action(async (local, remote, bytes) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

    console.log(bytes, local, remote);

    const remoteFilename = toRemotePath(join(remote, local));

    try {
      await PcsService.upload2(tokenJson.access_token, local, remoteFilename);
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