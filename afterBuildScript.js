// rollup watch 模式 导致bin失去x权限
const { openSync, fchmodSync, constants } = require('fs');
const fd = openSync('./dist/bin/mix.js', 'r');
fchmodSync(fd, constants.S_IRWXU | constants.S_IRGRP | constants.S_IXGRP | constants.S_IXOTH);
