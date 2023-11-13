import { type Command } from 'commander';
import { join, sep } from 'path';
import chalk from 'chalk';
import { log, toLocalPath, toRemotePath } from '@/utils';
import PcsService from '@/services/pcs';

export default (program: Command) => {
  program.command('download')
    .alias('dl')
    .description('download remote file.')
    .argument('[remote]', 'remote path', sep)
    .argument('[local]', 'local path', '.')
    .option('-t --token [token]', 'access token')
    .action(async (remote, local, options) => {
      const remoteFilename = toRemotePath(remote);

      try {
        const { list } = await PcsService.listFile(options.token, remoteFilename);
        
        if(list.length === 0) {
          list.push({
            server_filename: remoteFilename,
            path: remoteFilename,
            isdir: 0,
          } as any);
        }


        list.reduce(async (previousValue, currentValue) => {
          await previousValue;
          const localFilename = join(local, toLocalPath(currentValue.path));

          console.log(currentValue.path, localFilename);

          if(currentValue.isdir === 1) {
            return Promise.resolve();
          }

          log(`${chalk.blueBright('==>')} Downloading ${chalk.green(localFilename)}`);
          return PcsService.download(options.token, currentValue.path, localFilename) as any;
        }, Promise.resolve());
      // todo 
      } catch (err: any) {
        const { response: { data } } = err;
        log(`error code ${data.error_code || data.statusCode} : ${data.error_msg || data.statusMessage}`, chalk.red);
        return;
      }
    });
};
