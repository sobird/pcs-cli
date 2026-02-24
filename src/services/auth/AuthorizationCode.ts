/* eslint-disable @typescript-eslint/naming-convention */
/**
 * 授权码模式授权
 *
 * 开发者应用在获取用户的授权码 Code 之后，通过 Code 换取 Access Token 凭证。
 * Access Token 有效期30天，过期后支持刷新，刷新后的 Access Token 有效期仍为 30 天，刷新Access Token请按需刷新，不需要不停的刷新。
 * 刷新请求，如果API返回失败，旧的refresh_token会失效，此时需要重新发起授权请求，获取新的 Access Token、refresh_token，而不是使用旧的 refresh_token 循环再发起刷新请求。
 * refresh_token 只支持使用一次，refresh_token 使用后失效，下次刷新 Access Token 时需要使用上一次刷新请求响应中的 refresh_token。
 *
 * 获取到的授权码 code 有效期 10 分钟，且仅一次有效。
 * 授权码模式适用于有 Server 端的应用。
 *
 * sobird<i@sobird.me> at 2025/12/22 17:43:07 created.
 */

import { BaseOAuthClient, type OAuthClientConfig, type OAuthTokenResponse } from './OAuth';

export interface OAuthAuthorizationCodeConfig extends OAuthClientConfig {
  response_type: 'code';
  /**
   * AppID。注意硬件应用接入时此参数为必选参数。
   */
  device_id?: string;
  /**
   * 授权页面展示样式。参见授权展示方式。
   */
  display?: string;
  /**
   * 重定向后会带上state参数。建议开发者利用state参数来防止CSRF攻击。
   */
  state?: string;
  /**
   * 让用户通过扫二维码的方式登录百度账号时，可传递 “qrcode=1”。
   */
  qrcode?: number;
  /**
   * 此参数在已传 “qrcode=1” 参数时有效，可选值 watch，tv，kindle，speakers 用于对二维码展示样式调整。
   */
  qrloginfrom?: 'watch' | 'tv' | 'kindle' | 'speakers';
  /**
   * 此参数在已传 “qrcode=1” 参数时有效，用于设置二维码展示宽度。
   */
  qrcodeW?: number;
  /**
   * 此参数在已传 “qrcode=1” 参数时有效，用于设置二维码展示高度。
   */
  qrcodeH?: number;
  /**
   * 当需要加载登录页时强制用户输入用户名和密码，不会从 Cookies 中读取百度用户的登录状态，传递 “force_login=1”。
   */
  force_login?: number;
}

export class AuthorizationCodeGrant extends BaseOAuthClient {
  declare config: OAuthAuthorizationCodeConfig;

  constructor(config: Omit<OAuthAuthorizationCodeConfig, 'response_type' | 'redirect_uri' | 'scope'>) {
    super({
      ...config,
      response_type: 'code',
      redirect_uri: 'oob',
    });
  }

  // 获取授权URL
  getAuthorizeURL(): string {
    const { client_secret, ...params } = this.config;
    const searchParams = new URLSearchParams(params as unknown as Record<string, string>);

    return `https://openapi.baidu.com/oauth/2.0/authorize?${searchParams}`;
  }

  /**
   * 用授权码获取Token
   *
   * GET https://openapi.baidu.com/oauth/2.0/token?
   * grant_type=authorization_code&
   * code=用户授权码 Code 值&
   * client_id=您应用的AppKey&
   * client_secret=您应用的SecretKey&
   * redirect_uri=您应用设置的授权回调地址
   *
   * @param code
   * @returns
   */
  async authorize(code: string) {
    const {
      client_id, client_secret, redirect_uri, scope,
    } = this.config;
    const { data } = await this.axios.get<OAuthTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        redirect_uri,
        code,
        scope,
      },
    });
    return data;
  }

  // 处理回调（用于Web服务器）
  async handleCallback(url: string) {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const error = urlObj.searchParams.get('error');
    // const state = urlObj.searchParams.get('state');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('Authorization code not found in callback URL');
    }

    // 验证state（如果配置了）
    // if (this.config.state && this.config.state !== state) {
    //   throw new Error('Invalid state parameter');
    // }

    return this.authorize(code);
  }
}
