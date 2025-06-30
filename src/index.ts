#!/usr/bin/env node

import { install } from './commands/install';
import { use } from './commands/use';
import { list } from './commands/list';
import { uninstall } from './commands/uninstall';
import { current } from './commands/current';
import { execPhp } from './commands/exec';
import { env } from './commands/env';
import { help } from './commands/help';

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'install':
    install(args[0]);
    break;
  case 'use':
    use(args[0]);
    break;
  case 'current':
    current();
    break;
  case 'exec':
    execPhp(args);
    break;
  case 'env':
    env();
    break;
  case 'list':
    list();
    break;
  case 'uninstall':
    uninstall(args[0]);
    break;
  case 'help':
  default:
    help();
    break;
}
