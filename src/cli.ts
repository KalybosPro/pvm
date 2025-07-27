#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { loadGlobalConfig, loadLocalConfig } from './config/configManager';
import { detectPlatform } from './utils/osHelpers';
import logger from './utils/logger';

import installCommand from './commands/installCommand';
import uninstallCommand from './commands/uninstallCommand';
import useCommand from './commands/useCommand';
import listCommand from './commands/listCommand';
import currentCommand from './commands/currentCommand';
import whichCommand from './commands/whichCommand';
import localCommand from './commands/localCommand';
import globalCommand from './commands/globalCommand';
import autoCommand from './commands/autoCommand';
import configCommand from './commands/configCommand';
import updateCommand from './commands/updateCommand';
import phpCommand from './commands/phpCommand';

async function main() {
  const program = new Command();

  try {
    // Load global and local config
    await loadGlobalConfig();
    await loadLocalConfig();

    // Detect platform info
    const platformInfo = detectPlatform();
    logger.info(`Platform detected: ${platformInfo.os} ${platformInfo.arch}`);

    program
      .name('pvm')
      .description('PHP Version Manager CLI')
      .version('1.0.0');

    // Register commands
    program
      .command('install [version]')
      .description('Install a PHP version')
      .action((version: string | undefined) => installCommand(version));

    program
      .command('uninstall [version]')
      .description('Uninstall a PHP version')
      .action((version: string | undefined) => uninstallCommand(version));

    program
      .command('use [version]')
      .description('Use a PHP version globally')
      .option('-t, --temporary', 'Temporary usage for current session')
      .action((version: string | undefined, options: { temporary?: boolean }) =>
        useCommand(version, options)
      );

    program
      .command('list')
      .description('List installed and available PHP versions')
      .action(() => listCommand());

    program
      .command('current')
      .description('Show current active PHP version')
      .action(() => currentCommand());

    program
      .command('which')
      .description('Show full path of current active PHP binary')
      .action(() => whichCommand());

    program
      .command('local [version]')
      .description('Set or show local PHP version for current project')
      .action((version: string | undefined) => localCommand(version));

    program
      .command('global [version]')
      .description('Set or show global PHP version')
      .action((version: string | undefined) => globalCommand(version));

    program
      .command('auto')
      .description('Auto activate PHP version by .pvmrc detection')
      .action(() => autoCommand());

    program
      .command('config')
      .description('Configure pvm settings interactively')
      .action(() => configCommand());

    program
      .command('update')
      .description('Update list of available PHP versions')
      .action(() => updateCommand());

    program
      .command('php')
      .description('Run the local PHP binary with given arguments')
      .allowUnknownOption() // autorise de passer -v, -r, etc.
      .argument('[args...]')
      .action((args: string[]) => {
        // Si aucune option fournie, on met par défaut `-v`
        if (!args || args.length === 0) {
          args = ['-v'];
        }
        phpCommand(args);
      });


    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
      program.outputHelp(chalk.yellow);
    }
  } catch (error) {
    logger.error(`An unexpected error occurred: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
