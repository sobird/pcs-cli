/**
 * Baidu Personal Cloud Storage Services
 *
 * sobird<i@sobird.me> at 2023/11/09 19:42:40 created.
 */
import fs from 'fs';
import https from 'https';
import { dirname, join, relative } from 'path';

import axios, { AxiosInstance } from 'axios';
import Progress from 'progress';
// import axios, { InternalHttpRequestConfig } from 'utils/axios';

interface OauthDeviceResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  qrcode_url: string;
  expires_in: number;
  interval: number;
}

interface OauthTokenResponse {
  expires_in: number;
  refresh_token: string;
  access_token: string;
  session_secret: string,
  session_key: string,
  scope: string;
}

export interface PCSNode {
  app_id: number;
  black_tag: number;
  category: number;
  ctime: number;
  from_type: number;
  fs_id: number;
  isdelete: number;
  isdir: 0 | 1;
  local_ctime: number;
  local_mtime: number;
  mtime: number;
  oper_id: number;
  owner_id: number;
  owner_type: number;
  path: string;
  real_category: string;
  server_ctime: number;
  server_filename: string;
  server_mtime: number;
  share: 0;
  size: number;
  status: number;
  tkbind_id: number;
  user_id: number;
  wpfile: number;
}

export interface PCSFile extends PCSNode {
  extent_int2: number;
  extent_int8: number;
  extent_tinyint7: number;
  is_scene: number;
  pl: number;
  server_atime: number;
  unlist: number;
}

export interface PCSMeta extends PCSNode {
  extent_int3: number;
  extent_int8: number;
  extent_tinyint1: number;
  extent_tinyint2: number;
  extent_tinyint3: number;
  extent_tinyint4: number;
  ifhassubdir: 0 | 1;
  privacy: 0 | 1;
  source: 0 | 1;
  videotag: number;
}

interface PCSQuotaResponse {
  quota: number;
  request_id: number;
  used: number;
  file_tag: number;
}

interface PCSMetaResponse {
  list: [PCSMeta]
  request_id: number;
}

interface PcsFile {
  server_filename: string;
  server_ctime: number;
  server_mtime: number;
  size: number;
  isdir: 0 | 1;
  path: string;
}

interface PCSListResponse {
  list: PcsFile[],
  request_id: number;
}

interface PCSDeleteResponse {
  request_id: number;
}

const PcsService = {
  oauthDevice(appKey: string) {
    return axios.get<unknown, OauthDeviceResponse>('https://openapi.baidu.com/oauth/2.0/device/code', {
      params: {
        client_id: appKey,
        response_type: 'device_code',
        scope: 'basic,netdisk',
      },
    });
  },
  oauthToken(appKey: string, appSec: string, device_code: string) {
    return axios.get<unknown, OauthTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id: appKey,
        client_secret: appSec,
        code: device_code,
        grant_type: 'device_token',
        scope: 'basic,netdisk',
      },
    });
  },
  /** 刷新token */
  refreshToken(client_id: string, client_secret: string, refresh_token: string) {
    return axios.get('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token',
      },
    });
  },

};

export default PcsService;

export class PCSClient {
  protected axios: AxiosInstance;

  constructor(public name: string, public token: string) {
    this.axios = axios.create({
      timeout: 10000,
      baseURL: 'https://pcs.baidu.com/rest/2.0',
    });
  }

  /**
   * 查询容量信息
   *
   * @param access_token
   * @returns
   */
  async quota() {
    const { data } = await this.axios.get<PCSQuotaResponse>('/pcs/quota', {
      params: {
        method: 'info',
        access_token: this.token,
      },
    });
    return data;
  }

  /**
   * 查询文件信息
   *
   * @param access_token
   * @param path
   * @returns
   */
  async meta(path: string) {
    const { data } = await this.axios.get<PCSMetaResponse>('/pcs/file', {
      params: {
        method: 'meta',
        access_token: this.token,
        path: this.resolve(path),
      },
    });

    return data;
  }

  /**
   * 获取文件列表
   *
   * @param path
   * @returns
   */
  async list(path: string) {
    const { data } = await this.axios.get<PCSListResponse>('/pcs/file', {
      params: {
        method: 'list',
        access_token: this.token,
        path: this.resolve(path),
      },
    });
    return data;
  }

  /** 删除文件 */
  async delete(path: string) {
    const { data } = await axios.get<PCSDeleteResponse>('/pcs/file', {
      params: {
        method: 'delete',
        access_token: this.token,
        path: this.resolve(path),
      },
    });
    return data;
  }

  /**
   * 离线下载
   *
   * @deprecated
   *
   * @param source_url
   * @param save_path
   * @returns
   */
  async fetch(source_url: string, save_path: string) {
    const { data } = await axios.get('/pcs/services/cloud_dl', {
      params: {
        method: 'add_task',
        access_token: this.token,
        save_path: this.resolve(save_path),
        source_url,
      },
    });
    return data;
  }

  /**
   * 下载指定的文件
   *
   * @param path
   * @param local
   * @returns
   */
  async download(path: string, local: string) {
    fs.mkdirSync(dirname(local), { recursive: true });
    const writer = fs.createWriteStream(local);
    const { data, headers } = await this.axios.get('/pcs/file', {
      params: {
        method: 'download',
        access_token: this.token,
        path: this.resolve(path),
      },
      responseType: 'stream',
    });

    const totalLength = headers['content-length'];

    const progressBar = new Progress(' downloading [:bar] :rate/bps :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      // renderThrottle: 1,
      total: parseInt(totalLength, 10),
    });

    data.on('data', (chunk: Buffer) => { return progressBar.tick(chunk.length); });
    data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /** 上传文件 */
  async upload(localPath: string, path: string, ondup = 'overwrite', type?: string) {
    let uploadPath = `/rest/2.0/pcs/file?method=upload&access_token=${this.token}&path=${encodeURIComponent(path)}&ondup=${ondup}`;
    if (type) {
      uploadPath = `${uploadPath}&type=${type}`;
    }
    const fileStat = fs.statSync(localPath);
    const boundaryKey = Math.random().toString(16);
    const payload = `--${boundaryKey}\r\nContent-Type: text/plain\r\nContent-Disposition: form-data; name="file"; filename="${path}"\r\n\r\n`;
    const enddata = `\r\n--${boundaryKey}--`;
    const contentLength = Buffer.byteLength(payload) + Buffer.byteLength(enddata) + fileStat.size;
    const progressBar = new Progress('[:bar] :rate/bps :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: fileStat.size,
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'pcs.baidu.com',
        method: 'POST',
        path: uploadPath,
      }, (res) => {
        res.on('data', (data) => {
          resolve(JSON.parse(data));
        });
        res.on('end', () => {
          // todo
          // resolve(void 0);
        });
        res.on('error', (err) => {
          reject(err);
        });
      });

      req.setHeader('Content-Type', `multipart/form-data; boundary=${boundaryKey}`);
      req.setHeader('Content-Length', contentLength);
      req.write(payload);

      const fileStream = fs.createReadStream(localPath);
      fileStream.pipe(req, { end: false });
      fileStream.on('end', () => {
        req.end(enddata);
      });
      fileStream.on('data', (chunk) => {
        progressBar.tick(chunk.length);
      });
    });
  }

  /**
   * 分片上传
   *
   * @param path
   * @param param
   * @returns
   */
  async createSuperFile(path: string, param: object) {
    const { data } = await axios.get('/pcs/file', {
      params: {
        method: 'createsuperfile',
        access_token: this.token,
        path,
        param: JSON.stringify(param),
      },
    });
    return data;
  }

  get rootdir() {
    return join('/apps', this.name);
  }

  resolve(path: string) {
    return join(this.rootdir, path);
  }

  normalize(path: string) {
    // const pathPrefix = join('/apps', this.name);
    // if (path.indexOf(pathPrefix) === 0) {
    //   return path.substring(pathPrefix.length, path.length);
    // }
    return relative(this.rootdir, path);
  }
}
