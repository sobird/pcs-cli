/**
 * Baidu Personal Cloud Storage Services
 * 
 * sobird<i@sobird.me> at 2023/11/09 19:42:40 created.
 */
import fs from 'fs';
import axios from "@/utils/axios";

interface OauthDeviceResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  qrcode_url: string;
  expires_in: number;
  interval: number;
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
    return axios.get('https://openapi.baidu.com/oauth/2.0/token', {
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
    return axios.get('/pcs/quota', {
      params: {
        method: "info",
        access_token,
      }
    });
  },
  /** 上传文件 */
  upload(access_token: string, localPath: string, path: string, ondup="newcopy") {
    const formData = new FormData();

    formData.append('file', fs.createReadStream(localPath));

    return axios.post('https://c.pcs.baidu.com/rest/2.0/pcs/file', formData, {
      headers: {
        'content-type': 'multipart/form-data',
      },
      params: {
        method: "upload",
        access_token,
        path,
        ondup,
      }
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
  download(access_token: string, path: string) {
    return `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=download&access_token=${access_token}&path=${path}`;
  }
};

export default PcsService;
