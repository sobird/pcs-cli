/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/naming-convention */
import { existsSync } from 'fs';
import { type Command } from 'commander';
import chalk from 'chalk';
import prompts, { PromptObject } from 'prompts';
import dayjs from 'dayjs';
import open from 'open';
import {
  fileJSON, log, JSON_TMP, EXPIRES_IN,
} from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('init')
    .description('initialize baidu pcs')
    .option('-n, --name <string>', 'app name')
    .option('-k, --key <string>', 'app key')
    .option('-s, --secret <string>', 'app secret')
    .action(async (options) => {
      // 如果token存在且没有过期, 则提示用户是否要继续初始化
      const tokenJson = fileJSON('TOKEN');
      if (tokenJson && tokenJson.access_token) {
        log(`Your access token has not expired (expiration date: ${dayjs(tokenJson.expires_time).format('YYYY-MM-DD HH:mm:ss')}).`);
        const { value } = await prompts({
          type: 'confirm',
          name: 'value',
          message: 'Do you want to continue initializing?',
          initial: false,
        });

        if (!value) {
          return;
        }
      }

      // 如果 user_code 存在且没有过期，提示用户是否要用当前app信息生成token
      const deviceJson = fileJSON('DEVICE');
      if (deviceJson) {
        await getAccessTokenByDevice(deviceJson);
        return;
      }

      const asks: PromptObject[] = [];
      ['name', 'key', 'secret'].forEach((item) => {
        if (!options[item]) {
          asks.push({
            type: 'text',
            name: item,
            message: `Please enter baidu app ${item}`,
          });
        }
      });
      const asksRes = await prompts(asks);
      const pcsInfo = {
        ...options,
        ...asksRes,
      };

      // 如果 appName和appKey未设置则返回
      if (!['name', 'key'].every((item) => { return pcsInfo[item]; })) {
        return;
      }

      let confirm = true;

      // 如果存在则提示 是否覆盖
      if (existsSync(JSON_TMP.APP)) {
        const { value } = await prompts({
          type: 'confirm',
          name: 'value',
          message: 'Baidu pcs initialization will be begin. If you have already configured before, your old settings will be overwritten. Can you confirm?',
          initial: false,
        });
        confirm = value;
      }

      if (!confirm) {
        return;
      }
      // 覆盖写入pcs app配置
      fileJSON('APP', pcsInfo);

      await getAccessToken();
    });
};

/** 获取 access token by conf file */
async function getAccessToken() {
  const pcsappInfo = fileJSON('APP');
  const { key = 'client_id', secret } = pcsappInfo;

  if (secret) {
    try {
      const oauthDeviceResponse = await PcsService.oauthDevice(key);
      const deviceInfo = { ...oauthDeviceResponse, key, secret };
      // 将设备信息写入本地
      fileJSON('DEVICE', deviceInfo);

      await getAccessTokenByDevice(deviceInfo);
    } catch (err: any) {
      const { response: { data } } = err;
      console.log(`OAuth error ${data.error} : ${data.error_description}`);
    }
  } else {
    const oauth_url = `https://openapi.baidu.com/oauth/2.0/authorize?response_type=token&client_id=${key}&redirect_uri=oob&scope=netdisk`;
    await open(oauth_url);
    const accessTokenCreateTime = Date.now();

    log('You\'ll have to grab the access_token generated by Baidu.', chalk.hex('#FFA500'));
    log('');
    log(`1. Visit ${chalk.blue.underline(oauth_url)}`);
    log('2. After the page is being redirected (it should show something like OAuth 2.0), copy the current URL to your favorite text editor');
    log('3. Grab the access_token part, take only the part between "access_token=" and the next "&" symbol (without quotes).');
    log('4. Copy it and paste here, then press Enter.');

    const { access_token } = await prompts({
      type: 'text',
      name: 'access_token',
      message: 'access_token',
    });

    if (access_token) {
      const expireSecond = (Date.now() - accessTokenCreateTime) / 1000;
      const expires_in = EXPIRES_IN - expireSecond;

      fileJSON('TOKEN', {
        access_token,
        expires_in,
        key,
        secret,
      });
    }
  }
}

async function getAccessTokenByDevice(deviceInfo: any) {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    verification_url, user_code, device_code, key, secret,
  } = deviceInfo;
  await open(`${verification_url}?code=${user_code}`);

  log('Launch your favorite web browser and visit: ');
  log(verification_url, chalk.blue.underline);
  log(`Input ${chalk.bold.red(user_code)} as the user code if asked.`);
  log('After granting access to the application, come back here and ');

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Press Enter to continue',
    initial: true,
  });

  if (confirm) {
    const oauthTokenResponse = await PcsService.oauthToken(key, secret, device_code);
    fileJSON('TOKEN', {
      ...oauthTokenResponse,
      key,
      secret,
    });
    log('Successfully initialized', chalk.green);
    log(`access_token: ${chalk.yellowBright(oauthTokenResponse.access_token)}`);
    log(`refresh_token: ${chalk.yellowBright(oauthTokenResponse.refresh_token)}`);
  }
}
