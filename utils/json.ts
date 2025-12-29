import {
  readFileSync, existsSync, mkdirSync, writeFileSync, promises as fs,
} from 'node:fs';
import path from 'path';

/**
 * 异步读取 JSON 文件
 *
 * @param {string} filePath    JSON 文件路径
 * @returns    解析后的 JSON 对象
 */
export async function readJSON(filePath: string) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ENOENT') {
        throw new Error(`文件不存在: ${filePath}`);
      }
    }

    if (error instanceof SyntaxError) {
      throw new Error(`JSON 格式错误: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 同步读取 JSON 文件
 *
 * @param {string} filePath    JSON 文件路径
 * @returns     解析后的 JSON 对象
 */
export function readJSONSync(filePath: string) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ENOENT') {
        throw new Error(`文件不存在: ${filePath}`);
      }
    }

    if (error instanceof SyntaxError) {
      throw new Error(`JSON 格式错误: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 异步写入 JSON 文件
 *
 * @param {string} filePath    JSON 文件路径
 * @param {any} data    要写入的数据
 * @returns
 */
export async function writeJSON(filePath: string, data: unknown) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`写入文件失败: ${error.message}`);
    }
  }
}

/**
 * 同步写入 JSON 文件
 * @param {string} filePath    JSON 文件路径
 * @param {any} data    要写入的数据
 * @returns
 */
export function writeJSONSync(filePath: string, data: any) {
  try {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`写入文件失败: ${error.message}`);
    }
  }
}

/**
 * 异步更新 JSON 文件（读取、修改、写入）
 * @param {string} filePath    JSON 文件路径
 * @param {Function} updater    更新函数，接收当前数据并返回新数据
 * @returns    更新后的数据
 */
export async function updateJSON(filePath: string, updater: Function) {
  const data = await readJSON(filePath);
  const updatedData = updater(data);
  await writeJSON(filePath, updatedData);
  return updatedData;
}

/**
 * 同步更新 JSON 文件（读取、修改、写入）
 * @param {string} filePath    JSON 文件路径
 * @param {Function} updater    更新函数，接收当前数据并返回新数据
 * @returns     更新后的数据
 */
export function updateJSONSync(filePath: string, updater: Function) {
  const data = readJSONSync(filePath);
  const updatedData = updater(data);
  writeJSONSync(filePath, updatedData);
  return updatedData;
}
