import {
  createReadStream, createWriteStream, statSync, mkdirSync,
} from 'fs';
import { join, basename } from 'path';
import { pipeline } from 'stream/promises';

export async function splitFile(path: string, chunkSize: number, outputDir: string) {
  if (!path || typeof path !== 'string') {
    throw new TypeError('path must be a non-empty string');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new TypeError('chunkSize must be a positive integer');
  }
  if (!outputDir || typeof outputDir !== 'string') {
    throw new TypeError('outputDir must be a non-empty string');
  }

  const parts: string[] = [];

  const { size } = statSync(path);
  const fileName = basename(path);

  mkdirSync(outputDir, { recursive: true });

  for (let start = 0; start < size; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, size - 1);
    const partPath = join(outputDir, `${fileName}.${parts.length + 1}`);

    const readStream = createReadStream(path, { start, end });
    const writeStream = createWriteStream(partPath);

    // eslint-disable-next-line no-await-in-loop
    await pipeline(readStream, writeStream);
    parts.push(partPath);
  }
  return parts;
}
