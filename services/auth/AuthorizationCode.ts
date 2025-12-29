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
  qrloginfrom?: string;
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
  constructor(config: Omit<OAuthAuthorizationCodeConfig, 'responseType' | 'redirectURL'>) {
    super({
      responseType: 'code',
      redirectURL: 'oob',
      ...config,
    });
    // if (!config.redirectURL) {
    //   throw new Error('redirectURL is required for authorization_code grant');
    // }
  }

  // 获取授权URL
  getAuthorizeURL(): string {
    const searchParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectURL,
      scope: this.config.scope,
    });
    return `https://openapi.baidu.com/oauth/2.0/authorize?${searchParams}`;
  }

  // 用授权码获取Token
  async authorize(code: string) {
    const { data } = await this.axios.get<OAuthTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectURL,
        code,
        scope: 'basic,netdisk',
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
