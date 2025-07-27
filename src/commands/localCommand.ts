import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import logger from '../utils/logger';
import { ConfigManager } from '../config/configManager';
import { VersionsManager } from '../core/versionsManager';

export default async function localCommand(version?: string): Promise<void> {
  const configManager = ConfigManager.getInstance();

  try {
    if (!version) {
      const localVersion = configManager.getLocal('localVersion');
      if (localVersion) {
        logger.info(chalk.blue(`Local version: ${localVersion}`));
      } else {
        logger.info(chalk.yellow('No local version set.'));
      }
      return;
    }

    const versionsManager = new VersionsManager();
    const installed = await versionsManager.isVersionInstalled(version);
    if (!installed) {
      logger.error(chalk.red(`Version ${version} is not installed.`));
      process.exit(1);
    }

    await configManager.setLocal('localVersion', version);

    logger.info(chalk.green(`Local PHP version set to ${version}.`));
  } catch (error) {
    logger.error(chalk.red(`Failed to set local PHP version: ${(error as Error).message}`));
  }
}
