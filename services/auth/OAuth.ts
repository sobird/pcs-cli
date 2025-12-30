/**
 * 授权
 *
 * 如果期望应用访问用户的网盘文件，则需要经过用户同意，这个流程被称为“授权”。百度网盘开放平台基于 OAuth2.0 接入授权。OAuth2.0 是一种授权协议，通过该协议用户可以授权开发者应用访问个人网盘信息与文件。
 * 用户同意授权后，开发者应用会获取到一个 Access Token，该 Access Token 是用户同意授权的凭证。开发者应用需要依赖 Access Token 凭证调用百度网盘公开API，实现访问用户网盘信息与授权资源。
 * 关于实现用户授权，您可以选择`授权码模式`、`简化模式`或者`设备码模式`实现。
 *
 * sobird<i@sobird.me> at 2025/12/21 9:54:50 created.
 */

/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance } from 'axios';

// OAuth客户端配置
export interface OAuthClientConfig {
  /**
   * 固定值，值必须为device_code。
   */
  response_type: 'code' | 'token' | 'device_code';
  /**
   * 您应用的AppKey。
   */
  client_id: string;

  /**
   * 您应用的AppSecret
   */
  client_secret: string;

  /**
   * 授权后要回调的地址URL
   */
  redirect_uri?: 'oob' | string;

  /**
   * 固定值，值必须为basic,netdisk。
   */
  scope?: 'basic,netdisk';
}

// 令牌响应
export interface OAuthTokenResponse {
  expires_in: number;
  refresh_token?: string;
  access_token: string;
  session_secret?: string,
  session_key?: string,
  scope: string;
}

// 用户信息
export interface OAuthUserInfo {
  avatar_url: string;
  baidu_name: string;
  errmsg: string;
  errno: number;
  netdisk_name: string;
  request_id: string;
  uk: number;
  vip_type: number;
}

export interface RefreshTokenResponse {
  /**
   * 获取到的Access Token，Access Token是调用网盘开放API访问用户授权资源的凭证。
   */
  access_token:string;
  /**
   * Access Token的有效期，单位为秒。
   */
  expires_in:number;
  /**
   * 用于刷新Access Token, 有效期为10年。
   */
  refresh_token:string;
  /**
   * Access Token 最终的访问权限，即用户的实际授权列表。
   */
  scope: string;
}

export abstract class BaseOAuthClient {
  protected axios: AxiosInstance;

  constructor(public config: OAuthClientConfig) {
    this.config = {
      scope: 'basic,netdisk',
      ...config,
    };
    this.axios = axios.create({ timeout: 10000 });
  }

  /**
   * 生成授权URL（引导用户跳转第三方授权页）
   *
   * @param state
   */
  abstract getAuthorizeURL(params?: Record<string, any>): string;

  /**
   * 兑换访问令牌（用授权码换token）
   *
   * @param code
   */
  abstract authorize(code: string): Promise<OAuthTokenResponse>;

  /**
   * 获取用户信息（用访问令牌获取用户资料）
   *
   * @param accessToken
   */
  // eslint-disable-next-line class-methods-use-this
  async getUserInfo(access_token: string) {
    const { data } = await axios.get<OAuthUserInfo>('https://pan.baidu.com/rest/2.0/xpan/nas', {
      params: {
        method: 'uinfo',
        access_token,
        // vip_version,
      },
    });

    return data;
  }

  /**
   * 通用：刷新令牌
   *
   * @param refreshToken
   */
  async refreshToken(refresh_token: string) {
    const { client_secret, client_id } = this.config;

    const { data } = await axios.get<RefreshTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        grant_type: 'refresh_token',
        client_id,
        client_secret,
        refresh_token,
      },
    });
    return data;
  }
}
