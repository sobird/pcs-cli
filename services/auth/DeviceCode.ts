/**
 * 设备码模式授权
 *
 * 对于弱输入设备，不支持浏览器或输入受限的设备（如儿童手表），推荐使用设备码模式接入授权。
 * 开发者获取设备码，用户授权成功后，开发者通过设备码成功换取 Access Token。
 * Access Token 有效期30天，过期后支持刷新，刷新后的 Access Token 有效期仍为 30 天，刷新Access Token请按需刷新，不需要不停的刷新。
 * 刷新请求，如果API返回失败，旧的refresh_token会失效，此时需要重新发起授权请求，获取新的 Access Token、refresh_token，而不是使用旧的 refresh_token 循环再发起刷新请求。
 * refresh_token 只支持使用一次，refresh_token 使用后失效，下次刷新 Access Token 时需要使用上一次刷新请求响应中的 refresh_token。
 * 使用 device_code 轮询换取 Access Token 时，注意轮询间隔，一般不能低于为 5 秒。
 * 用户授权有两种方式：一种是扫描二维码方式，另一种是输入用户码方式。关于用户码，在开发者获取设备码的同时，会返回用户码。
 *
 * ## 具体授权实现
 * 设备码模式授权，主要依赖以下 3 步：
 * * 获取设备码 device code 、用户码 user code。
 * * 引导用户授权。
 * * 用 device code 轮询换取 access token。
 *
 * https://openapi.baidu.com/oauth/2.0/device/code?response_type=device_code&client_id=您应用的AppKey&scope=basic,netdisk
 *
 * @see https://pan.baidu.com/union/doc/fl1x114ti?from=open-sdk-php
 *
 * sobird<i@sobird.me> at 2025/12/19 0:51:42 created.
 */

import axios from '@/utils/axios';

// https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=58tGN6NF3c2rrFHz0SynM8ZEtfuSd5ZG&redirect_uri=oob&scope=basic,netdisk&device_id=42602234

import { BaseOAuthClient, type OAuthClientConfig, type OAuthTokenResponse } from './OAuth';

/**
 * 授权展示方式，既授权页面展示样式。
 * 为了适配不同的应用场景，百度网盘开放平台提供了多种样式的授权页面，具体实现可以通过 display 参数来控制。
 *
 * * page  全屏形式的授权页面(默认)，适用于 web 应用。
 * * popup  弹框形式的授权页面，适用于桌面软件应用和 web 应用
 * * dialog  浮层形式的授权页面，只能用于站内 web 应用
 * * mobile  Iphone/Android 等智能移动终端上用的授权页面，适用于 Iphone/Android 等智能移动终端上的应用
 * * tv  电视等超大显示屏使用的授权页面
 * * pad  适配 IPad/Android 等智能平板电脑使用的授权页面
 */
export type Display = 'page' | 'popup' | 'dialog' | 'mobile' | 'tv' | 'pad';

export interface OAuthDeviceCodeParams {
  /**
   * 固定值，值必须为device_code。
   */
  response_type: string;
  /**
   * 您应用的AppKey。
   */
  client_id: string;
  /**
   * 固定值，值必须为basic,netdisk。
   */
  scope: string;
}

export interface OAuthDeviceCodeResponse {
  /**
   * 设备码，可用于生成单次凭证 Access Token。
   */
  device_code: string;
  /**
   * 用户码。
   * 如果选择让用户输入 user code 方式，来引导用户授权，设备需要展示 user code 给用户。
   */
  user_code: string;
  /**
   * 用户输入 user code 进行授权的 url。
   */
  verification_url: string;
  /**
   * 二维码url，用户用手机等智能终端扫描该二维码完成授权。
   */
  qrcode_url: string;
  /**
   * device_code 的过期时间，单位：秒。
   * 到期后 device_code 不能换 Access Token。
   */
  expires_in: number;
  /**
   * device_code 换 Access Token 轮询间隔时间，单位：秒。
   * 轮询次数限制小于 expire_in/interval。
   */
  interval: number;
}

export class DeviceCodeGrant extends BaseOAuthClient {
  constructor(config: Omit<OAuthClientConfig, 'responseType' | 'redirectURL'>) {
    super({
      responseType: 'device_code',
      redirectURL: 'oob',
      ...config,
    });
  }

  // 获取设备码
  async getDeviceCode() {
    const { data } = await axios.get<OAuthDeviceCodeResponse>('https://openapi.baidu.com/oauth/2.0/device/code', {
      params: {
        response_type: 'device_code',
        client_id: this.config.clientId,
        scope: this.config.scope,
      },
    });

    return data;
  }

  // eslint-disable-next-line class-methods-use-this
  getAuthorizeURL(deviceCode: OAuthDeviceCodeResponse) {
    return `${deviceCode.verification_url}?code=${deviceCode.user_code}`;
  }

  async authorize(code: string) {
    const { data } = await axios.get<OAuthTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'device_token',
        scope: 'basic,netdisk',
      },
    });

    return data;
  }
}
