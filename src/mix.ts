/**
 * mix.ts
 * 
 * sobird<i@sobird.me> at 2023/11/09 11:39:37 created.
 */

import { Command } from 'commander';
import {description, version}  from '../package.json';

const program = new Command();

program
  .name('mix')
  .description(description)
  // .usage('[command] [option]')
  .version(version);

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });
  
program.parse();

export default program;
