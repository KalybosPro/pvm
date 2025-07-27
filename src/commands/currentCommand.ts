import chalk from 'chalk';
import { ConfigManager } from '../config/configManager';
import logger from '../utils/logger';
import path from 'path';
import { getPvmDir } from '../utils/fileHelpers';
import { version } from 'os';

export default async function currentCommand(): Promise<void> {
  try {
    const configManager = ConfigManager.getInstance();
    const localVersion = configManager.getLocal('localVersion');
    const globalVersion = configManager.getGlobal('globalVersion');

    if (localVersion) {
      const phpBin = getPhpBin(localVersion);
      console.log(chalk.blue(`PHP version (local): ${localVersion}`));
      console.log(`Binary path: ${chalk.cyan(phpBin)}`);
    } else if (globalVersion) {
      const phpBin = getPhpBin(globalVersion);
      console.log(chalk.green(`PHP version (global): ${globalVersion}`));
      console.log(`Binary path: ${chalk.cyan(phpBin)}`);
    } else {
      console.log(chalk.yellow('No PHP version currently set.'));
    }
  } catch (error) {
    logger.error(chalk.red(`Failed to get current PHP version: ${(error as Error).message}`));
  }
}

function getPhpBin(localVersion: string): string {
  let phpBin = '';

  if (process.platform === 'win32') {
    phpBin = path.join(getPvmDir(), 'versions', localVersion, 'php.exe');
  } else {
    phpBin = path.join(getPvmDir(), 'versions', localVersion, 'bin', 'php');
  }

  return phpBin;
}
