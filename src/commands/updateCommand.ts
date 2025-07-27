import chalk from 'chalk';
import { ManifestManager } from '../core/manifestManager';
import logger from '../utils/logger';

export default async function updateCommand(): Promise<void> {
  try {
    const manifestManager = new ManifestManager();
    const before = manifestManager.listAvailableVersions();

    await manifestManager.updateManifest();

    const after = manifestManager.listAvailableVersions();

    const added = after.filter(v => !before.includes(v));
    const removed = before.filter(v => !after.includes(v));

    logger.info(chalk.green('Manifest updated.'));
    if (added.length > 0) {
      logger.info(chalk.green(`Added versions: ${added.join(', ')}`));
    }
    if (removed.length > 0) {
      logger.info(chalk.yellow(`Removed versions: ${removed.join(', ')}`));
    }
  } catch (error) {
    logger.error(chalk.red(`Failed to update manifest: ${(error as Error).message}`));
  }
}
