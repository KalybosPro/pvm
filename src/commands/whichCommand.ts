import path from 'path';
import chalk from 'chalk';
import { ConfigManager } from '../config/configManager';
import { getPvmDir } from '../utils/fileHelpers';
import logger from '../utils/logger';

export default async function whichCommand(): Promise<void> {
  try {
    const configManager = ConfigManager.getInstance();

    const localVersion = configManager.getLocal('localVersion');
    const globalVersion = configManager.getGlobal('globalVersion');

    const version = localVersion || globalVersion;
    if (!version) {
      console.log(chalk.yellow('No PHP version currently set.'));
      return;
    }

    const phpBin = getPath(version);

    console.log(phpBin);
  } catch (error) {
    logger.error(chalk.red(`Failed to resolve PHP executable path: ${(error as Error).message}`));
  }
}

function getPath(version: string): string {
  let p = '';
  if (process.platform === 'win32') {
    p = path.join(getPvmDir(), 'versions', version, 'php.exe');
  } else {
    p = path.join(getPvmDir(), 'versions', version, 'bin', 'php');
  }

  return p;
}
