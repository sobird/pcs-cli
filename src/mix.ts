import { readFileSync } from "fs";
import { Command } from 'commander';
const pkginfo = JSON.parse(readFileSync(__dirname + "/../package.json", "utf8"));

const program = new Command();

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

program.parse();

export default  'mix';
