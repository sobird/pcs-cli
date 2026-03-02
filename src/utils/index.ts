import { createHash } from 'node:crypto';
import {
  createReadStream,
  readFileSync,
} from 'node:fs';

export { link } from './link';
export { splitFile } from './splitFile';

export function md5File(file: string, callback: typeof Function): void {
  const hash = createHash('md5');
  const rs = createReadStream(file);
  rs.on('data', (chunk) => {
    hash.update(chunk);
  });
  rs.on('end', () => {
    callback(hash.digest('hex'));
  });
}

export function md5FileSync(file: string): string {
  const hash = createHash('md5');
  const data = readFileSync(file);
  hash.update(data);
  return hash.digest('hex');
}
