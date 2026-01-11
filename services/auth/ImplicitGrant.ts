/**
 * 简化模式授权
 *
 * 相比授权码模式，简化模式不需要获取授权码 Code，直接获取 Access Token 凭证。
 * 简化模式不支持刷新 Access Token，过期后需用户重新登录授权。
 * 简化模式适用于无 server 端配合的应用。
 *
 * @see https://pan.baidu.com/union/doc/6l0ryrjzv
 *
 * sobird<i@sobird.me> at 2025/12/22 18:18:33 created.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import { BaseOAuthClient, type OAuthClientConfig, type OAuthTokenResponse } from './OAuth';

export interface OAuthImplicitGrantConfig extends OAuthClientConfig {
  response_type: 'token',
  /**
   * 授权页面展示样式。参见授权展示方式。
   */
  display?: string;
  /**
   * 重定向后会带上state参数。建议开发者利用state参数来防止CSRF攻击。
   */
  state?: string;
}

export class ImplicitGrant extends BaseOAuthClient {
  declare config: OAuthImplicitGrantConfig;

  constructor(config: Omit<OAuthImplicitGrantConfig, 'client_secret' | 'response_type' | 'redirect_uri'>) {
    super({
      ...config,
      response_type: 'token',
      redirect_uri: 'oob',
    });
  }

  getAuthorizeURL(): string {
    const { client_secret, ...params } = this.config;
    const searchParams = new URLSearchParams(params as unknown as Record<string, string>);

    return `https://openapi.baidu.com/oauth/2.0/authorize?${searchParams}`;
  }

  async authorize(result: string): Promise<OAuthTokenResponse> {
    let token: OAuthTokenResponse;

    if (result.startsWith('http')) {
      // 从回调URL解析
      token = this.parseTokenFromUrl(result);
    } else if (result.includes('access_token=')) {
      // 从hash字符串解析
      token = this.parseTokenFromHash(result);
    } else {
      // 假设直接是access_token
      token = {
        access_token: result,
        expires_in: 2592000, // 默认30天
        scope: this.config.scope as string,
      };
    }
    return token;
  }

  private parseTokenFromUrl(url: string): OAuthTokenResponse {
    const urlObj = new URL(url);
    return this.parseTokenFromHash(urlObj.hash.substring(1));
  }

  private parseTokenFromHash(hash: string): OAuthTokenResponse {
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const error = params.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!accessToken) {
      throw new Error('Access token not found');
    }

    return {
      access_token: accessToken,
      expires_in: parseInt(expiresIn || '2592000', 10),
      scope: params.get('scope') || this.config.scope as string,
      session_key: params.get('session_key') || undefined,
      session_secret: params.get('session_secret') || undefined,
    };
  }
}
