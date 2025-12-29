import { homedir } from 'node:os';
import path from 'node:path';

/**
 * 应用根目录
 */
export const PCS_HOME = path.join(homedir(), '.pcs');

/**
 * 应用配置
 */
export const PCS_CONF = path.join(PCS_HOME, 'config.json');

/**
 * 过期时间 30天
 */
export const TOKEN_EXPIRES_IN = 2592000;

/**
 * 百度网盘 开放平台 创建应用 网址
 */
export const CREATE_APP_URL = 'https://pan.baidu.com/union/console/createapp';

/**
 * 百度网盘 开放平台 应用列表 网址
 */
export const APP_LIST_URL = 'https://pan.baidu.com/union/console/applist';
