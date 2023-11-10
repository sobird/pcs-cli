/**
 * Baidu Personal Cloud Storage Services
 * 
 * sobird<i@sobird.me> at 2023/11/09 19:42:40 created.
 */
import fs from 'fs';
import { dirname, basename } from 'path';
import Progress from 'progress';
import ora from 'ora';
import FormData from 'form-data';
import chalk from 'chalk';
import axios, { InternalHttpRequestConfig } from "@/utils/axios";

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

interface QuotaResponse {
  quota: number;
  request_id: number;
  used: number;
}

interface PcsFile {
  server_filename: string;
  server_ctime: number;
  server_mtime: number;
}

interface ListFileResponse {
  list: PcsFile[],
  request_id: number;
}

const PcsService = {
  oauthDevice(appKey: string) {
    return axios.get<unknown, OauthDeviceResponse>('https://openapi.baidu.com/oauth/2.0/device/code', {
      params: {
        client_id: appKey,
        response_type: "device_code",
        scope: "basic,netdisk"
      }
    });
  },
  oauthToken(appKey: string, appSec: string, device_code: string) {
    return axios.get<unknown, OauthTokenResponse>('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id: appKey,
        client_secret: appSec,
        code: device_code,
        grant_type: "device_token",
        scope: "basic,netdisk"
      }
    });
  },
  /** 刷新token */
  refreshToken(client_id: string, client_secret: string, refresh_token: string) {
    return axios.get('https://openapi.baidu.com/oauth/2.0/token', {
      params: {
        client_id,
        client_secret,
        refresh_token,
        grant_type: "refresh_token",
      }
    });
  },

  /** 查询容量信息 */
  quotaInfo(access_token: string) {
    return axios.get<unknown, QuotaResponse>('/pcs/quota', {
      params: {
        method: "info",
        access_token,
      }
    });
  },

  getMeta(access_token: string, path: string) {
    return axios.get<unknown>('/pcs/file', {
      params: {
        method: "meta",
        access_token,
        path
      }
    });
  },

  listFile(access_token: string, path: string) {
    return axios.get<unknown, ListFileResponse>('/pcs/file', {
      params: {
        method: "list",
        access_token,
        path
      }
    });
  },

  async download(access_token: string, path: string, local: string) {
    fs.mkdirSync(dirname(local), { recursive: true });
    const writer = fs.createWriteStream(local);
    const { data, headers } = await axios.get('/pcs/file', {
      params: {
        method: "download",
        access_token,
        path
      },
      responseType: 'stream',
      responseParser: (response: any) => response,
    } as InternalHttpRequestConfig);

    const totalLength = headers['content-length']

    const progressBar = new Progress(' downloading [:bar] :rate/bps :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      // renderThrottle: 1,
      total: parseInt(totalLength)
    });

    data.on('data', (chunk: any) => progressBar.tick(chunk.length));
    data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    });
  },

  /** 上传文件 */
  async upload(access_token: string, localPath: string, path: string, ondup = "overwrite") {
    const formData = new FormData();
    const rs = fs.createReadStream(localPath)
    formData.append('file', rs);
    const formHeaders = formData.getHeaders();

    const spinner = ora(`Uploading ${basename(localPath)}`).start();
    return axios.post('https://c.pcs.baidu.com/rest/2.0/pcs/file', formData, {
      headers: {
        ...formHeaders
      },
      params: {
        method: "upload",
        access_token,
        path,
        ondup,
      },
      timeout: 0,
      responseType: 'stream',
      responseParser: (response: any) => response,
    } as InternalHttpRequestConfig).then(() => {
      spinner.succeed(`${chalk.green(basename(localPath))} was successful uploaded!`)
    });
  },
  /** 删除文件 */
  delete(access_token: string, path: string) {
    return axios.get('/pcs/file', {
      params: {
        method: "delete",
        access_token,
        path,
      }
    });
  },
  /** 离线下载 */
  fetch(access_token: string, save_path: string, source_url: string) {
    return axios.get('/pcs/services/cloud_dl', {
      params: {
        method: 'add_task',
        access_token,
        save_path,
        source_url,
      }
    });
  },

  /** 分片上传 */
  uploadSuper() {
    // 
  },
  /** 下载文件 */
  // download(access_token: string, path: string) {
  //   return `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=download&access_token=${access_token}&path=${path}`;
  // }
};

export default PcsService;
