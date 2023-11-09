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
