/* eslint-disable @typescript-eslint/naming-convention */
// scripts/prepublish.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pkg from '../package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, '../package.json');

// 修改 bin 字段
pkg.bin.pcs = 'dist/pcs.js';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
