/**
 * mix.ts
 * 
 * sobird<i@sobird.me> at 2023/11/09 11:39:37 created.
 */

import { Command } from 'commander';
import {name, description, version}  from '../package.json';

const program = new Command();

program
  .name(name)
  .description(description)
  .version(version);

program.parse();

export default 'mix';
