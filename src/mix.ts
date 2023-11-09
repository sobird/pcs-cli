/**
 * mix.ts
 * 
 * sobird<i@sobird.me> at 2023/11/09 11:39:37 created.
 */

import { readFileSync } from "fs";
import { Command } from 'commander';
const {name, description, version} = JSON.parse(readFileSync(__dirname + "/../package.json", "utf8"));
const program = new Command();

program
  .name(name)
  .description(description)
  .version(version);

program.parse();

export default  'mix';
