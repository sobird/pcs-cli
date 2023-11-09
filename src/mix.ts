/**
 * mix.ts
 * 
 * sobird<i@sobird.me> at 2023/11/09 11:39:37 created.
 */

import { Command, Option } from 'commander';
import prompts from 'prompts';
import { description, version } from '../package.json';
import BaiduPCSService from './services/bdpcs';

const program = new Command();

program
  .name('mix')
  .description(description)
  .option(
    "-f, --filename [filename]",
    "The filename to use when reading from stdin. This will be used in source-maps, errors etc."
  )
  // .usage('[command] [option]')
  .version(version);

program.command('init')
  .description('Initialization will be begin. If you have already configured the uploader before, your old settings will be overwritten.')
  // .argument('<string>', 'string to split')
  .option('-n, --AppName <appName>', 'app name')
  .option('-k, --AppKey <appKey>', 'app key')
  .option('-s, --AppSecret <appSecret>', 'App Secret')
  .action((options) => {
    // const limit = options.first ? 1 : undefined;
    // console.log(str.split(options.separator, limit));
    // console.log(options);

    const questions = [
      {
        type: 'text',
        name: 'username',
        message: 'What is your GitHub username?'
      },
      {
        type: 'number',
        name: 'age',
        message: 'How old are you?'
      },
      {
        type: 'text',
        name: 'about',
        message: 'Tell something about yourself',
        initial: 'Why should I?'
      }
    ];

    (async () => {
      const response = await prompts(questions);
    
      console.log(response); // => { value: 24 }
    })();
  });

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .addOption(
    new Option('-s, --size <type>', 'size').choices([
      'small',
      'medium',
      'large',
    ])
  )
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse();

export default program;
