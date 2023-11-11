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

program
  .name(name)
  .description(`Baidu Personal Cloud Storage Scaffold.\n\nYou can get app key by visit ${chalk.blue.underline(createAppUrl)}.\nIf you have already created an app, you can visit ${chalk.blue.underline(appListUrl)} and get it in your app's info.`)
  .version(version);

program.command('init')
  .description('Initialize Baidu Personal Cloud Storage')
  .option('-n, --name <string>', 'app name')
  .option('-k, --key <string>', 'app key')
  .option('-s, --secret <string>', 'app secret')
  .action(async (options) => {
    // 如果token存在且没有过期, 则提示用户是否要继续初始化
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (tokenJson && tokenJson.access_token) {
      log(`Your access token has not expired (expiration date: ${dayjs(tokenJson.expires_time).format('YYYY-MM-DD HH:mm:ss')}).`);
      const { value } = await prompts({
        type: "confirm",
        name: 'value',
        message: `Do you want to continue initializing?`,
        initial: false
      });

      if (!value) {
        return;
      }
    }

    // 如果 user_code 存在且没有过期，提示用户是否要用当前app信息生成token
    const deviceJson = readUnexpiredJsonSync(deviceFile);
    if (deviceJson) {
      await getAccessTokenByDevice(deviceJson);
      return;
    }

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

    // 如果 appName和appKey未设置则返回
    if (!['name', 'key'].every(item => pcsInfo[item])) {
      return;
    }

    let confirm = true;

    // 如果存在则提示 是否覆盖
    if (fs.existsSync(pcsappFile)) {
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
    // 覆盖写入pcs app配置
    writeJsonSync(pcsappFile, pcsInfo);

    await getAccessToken();

  });

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
  .action(async (local,remote) => {
    const tokenJson = readUnexpiredJsonSync(tokenFile);
    if (!tokenJson || !tokenJson.access_token) {
      log('Your access token does not exist or has expired', chalk.red);
      return;
    }

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

/** 获取 access token by conf file */
async function getAccessToken() {
  const pcsappInfo = readUnexpiredJsonSync(pcsappFile);
  const { key = 'client_id', secret } = pcsappInfo;

  if (secret) {
    try {
      const oauthDeviceResponse = await PcsService.oauthDevice(key);
      const deviceInfo = { ...oauthDeviceResponse, key, secret };
      // 将设备信息写入本地
      writeJsonSync(deviceFile, deviceInfo);

      await getAccessTokenByDevice(deviceInfo);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`OAuth error ${data.error} : ${data.error_description}`);
      return;
    }
  } else {
    const oauth_url = `https://openapi.baidu.com/oauth/2.0/authorize?response_type=token&client_id=${key}&redirect_uri=oob&scope=netdisk`;
    await open(oauth_url);
    const accessTokenCreateTime = Date.now();

    log(`You'll have to grab the access_token generated by Baidu.`, chalk.hex('#FFA500'));
    log('');
    log(`1. Visit ${chalk.blue.underline(oauth_url)}`);
    log(`2. After the page is being redirected (it should show something like OAuth 2.0), copy the current URL to your favorite text editor`);
    log(`3. Grab the access_token part, take only the part between "access_token=" and the next "&" symbol (without quotes).`);
    log(`4. Copy it and paste here, then press Enter.`);

    const { access_token } = await prompts({
      type: 'text',
      name: 'access_token',
      message: 'access_token',
    });

    if (access_token) {
      const expireSecond = (Date.now() - accessTokenCreateTime) / 1000;
      const expires_in = defaultExpiresIn - expireSecond;

      writeJsonSync(tokenFile, {
        access_token,
        expires_in,
        key,
        secret
      });
    }
  }

}

async function getAccessTokenByDevice(deviceInfo: any) {
  const { verification_url, user_code, device_code, key, secret } = deviceInfo;
  await open(`${verification_url}?code=${user_code}`);

  log('Launch your favorite web browser and visit: ');
  log(`${chalk.blue.underline(verification_url)}`);
  log(`Input ${chalk.bold.red(user_code)} as the user code if asked.`);
  log(`After granting access to the application, come back here and `);

  const { confirm } = await prompts({
    type: "confirm",
    name: 'confirm',
    message: `Press Enter to continue`,
    initial: true
  });

  if (confirm) {
    const oauthTokenResponse = await PcsService.oauthToken(key, secret, device_code);
    writeJsonSync(tokenFile, {
      ...oauthTokenResponse,
      key,
      secret
    });
    log('Successfully initialized', chalk.green);
    log(`access_token: ${chalk.yellowBright(oauthTokenResponse.access_token)}`);
    log(`refresh_token: ${chalk.yellowBright(oauthTokenResponse.refresh_token)}`);
  }
}

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