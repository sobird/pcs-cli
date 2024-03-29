/* eslint-disable no-param-reassign */
import {
  createReadStream,
  readFile,
  readFileSync,
  mkdir,
  mkdirSync,
  writeFile,
  writeFileSync,
  existsSync,
  stat,
  statSync,
} from 'fs';
import os from 'os';
import {
  dirname, join, basename, resolve,
} from 'path';
import { createHash } from 'crypto';
import chalk from 'chalk';
import { name } from '../../package.json';

const TMP = resolve(os.homedir(), `.${name}`);
export const JSON_TMP = {
  APP: resolve(TMP, 'pcsapp'),
  DEVICE: resolve(TMP, 'device'),
  TOKEN: resolve(TMP, 'token'),
};

export const EXPIRES_IN = 2592000; // 单位
export const CREATE_APP_URL = 'https://pan.baidu.com/union/console/createapp';
export const APP_LIST_URL = 'https://pan.baidu.com/union/console/applist';

export function md5File(file: string, callback: typeof Function) {
  const hash = createHash('md5');
  const rs = createReadStream(file);
  rs.on('data', (chunk) => {
    hash.update(chunk);
  });
  rs.on('end', () => {
    callback(hash.digest('hex'));
  });
}

export function md5FileSync(file: string) {
  const hash = createHash('md5');
  const data = readFileSync(file);
  hash.update(data);
  return hash.digest('hex');
}

export function writeJson(path: string, json: object, callback: typeof Function) {
  mkdir(dirname(path), { recursive: true }, (mkdirErr) => {
    if (mkdirErr) {
      throw mkdirErr;
    }
    writeFile(path, JSON.stringify(json), (writeFileErr) => {
      if (writeFileErr) {
        throw writeFileErr;
      }
      callback();
    });
  });
}

export function writeJsonSync(path: string, json: object) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(json));
}

export function readJson(path: string, callback: typeof Function) {
  if (existsSync(path)) {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      callback(data);
    });
  }
}

export function readJsonSync(path: string) {
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return null;
  }
}

/** 读取未过期的信息 过期则返回null */
export function readUnexpiredJsonSync(path: string, expiresField = 'expires_in') {
  const info = readJsonSync(path);
  if (!info) {
    return null;
  }
  const expiresInfo = info[expiresField];
  // 如果不存在 expiresField 则认为长期有效
  if (!expiresInfo) {
    return info;
  }

  const { mtimeMs } = statSync(path);
  const expireSecond = (Date.now() - mtimeMs) / 1000;

  if (expireSecond > expiresInfo) {
    return null;
  }

  const expiresTime = mtimeMs + expiresInfo * 1000;
  info.expires_time = expiresTime;
  return info;
}

export function fileJSON(key: keyof typeof JSON_TMP, json?: object) {
  if (json) {
    return writeJsonSync(JSON_TMP[key], json);
  }
  return readUnexpiredJsonSync(JSON_TMP[key]);
}

export function log(message: string, color = chalk.blackBright) {
  console.log(color(message));
}

/** 转化为远程路径 */
export function toRemotePath(path: string) {
  const { name: key } = fileJSON('APP');
  return join('/apps', key, path);
}

export function toLocalPath(path: string) {
  const { name: key } = fileJSON('APP');
  const pathPrefix = join('/apps', key);
  if (path.indexOf(pathPrefix) === 0) {
    return path.substring(pathPrefix.length, path.length);
  }

  return path;
}

export function splitFile(path: string, bytes: number, temp: string) {
  let partNum = 0;
  const parts: string[] = [];
  function copy(start: number, end: number, size: number) {
    return new Promise((PromiseResolve, reject) => {
      if (start >= size) {
        PromiseResolve(undefined);
      } else {
        if (end > size - 1) {
          end = size - 1;
        }
        const readStream = createReadStream(path, { start, end });
        let data = Buffer.from([]);
        readStream.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
        readStream.on('end', async () => {
          const partPath = join(temp, `${basename(path)}.${partNum + 1}`);
          mkdirSync(dirname(partPath), { recursive: true });
          writeFile(partPath, data, async (err) => {
            if (err) {
              reject(err);
            }
            parts.push(partPath);
            partNum += 1;
            start = end + 1;
            end += bytes;
            await copy(start, end, size);
            PromiseResolve(undefined);
          });
        });
        readStream.on('err', (err) => {
          reject(err);
        });
      }
    });
  }
  return new Promise((PromiseResolve, reject) => {
    stat(path, async (err, res) => {
      if (err) {
        return reject(err);
      }

      const { size } = res;
      await copy(0, bytes - 1, size);
      return PromiseResolve(parts);
    });
  });
}
