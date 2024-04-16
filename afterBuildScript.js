// rollup watch 模式 导致bin失去x权限
import { openSync, fchmodSync, constants } from 'fs';

console.log('constants', constants.S_IRWXU, constants.S_IRGRP);

const fd = openSync('./dist/bin/pcs.js', 'r');
fchmodSync(fd, constants.S_IRWXU | constants.S_IRGRP | constants.S_IXGRP | constants.S_IXOTH);
