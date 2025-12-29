import { statSync, promises as fs } from 'fs';

import { readJSON, readJSONSync } from './json';

/**
 * 异步读取未过期的信息 过期则返回null
 *
 * @param path
 * @param expiresField
 * @returns
 */
export async function readConf(path: string, expiresField = 'expires_in') {
  const info = await readJSON(path);
  if (!info) {
    return null;
  }
  const expiresInfo = info[expiresField];
  // 如果不存在 expiresField 则认为长期有效
  if (!expiresInfo) {
    return info;
  }

  const { mtimeMs } = await fs.stat(path);
  const expireSecond = (Date.now() - mtimeMs) / 1000;

  if (expireSecond > expiresInfo) {
    return null;
  }

  const expiresTime = mtimeMs + expiresInfo * 1000;
  info.expires_time = expiresTime;
  return info;
}

/**
 * 读取未过期的信息 过期则返回null
 *
 * @param path
 * @param expiresField
 * @returns
 */
export function readConfSync(path: string, expiresField = 'expires_in') {
  const info = readJSONSync(path);
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
