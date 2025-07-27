import chalk from 'chalk';
import { VersionsManager } from '../core/versionsManager';
import { ManifestManager } from '../core/manifestManager';
import { ConfigManager } from '../config/configManager';
import logger from '../utils/logger';

export default async function listCommand(): Promise<void> {
  try {
    const versionsManager = new VersionsManager();
    const manifestManager = new ManifestManager();
    const configManager = ConfigManager.getInstance();

    await manifestManager.loadManifest();

    const installedVersions = await versionsManager.listVersions();
    const availableVersions = manifestManager.listAvailableVersions();

    const globalVersion = configManager.getGlobal('globalVersion');
    const localVersion = configManager.getLocal('localVersion');

    console.log(chalk.yellow('Installed PHP Versions:'));
    for (const v of installedVersions) {
      let mark = '  ';
      if (v === localVersion) mark = chalk.blue('L ');
      else if (v === globalVersion) mark = chalk.green('G ');
      console.log(mark + v);
    }
    if (installedVersions.length === 0) {
      console.log('  ' + chalk.red('No versions installed.'));
    }
    console.log();

    console.log(chalk.yellow('Available PHP Versions:'));
    if (availableVersions.length === 0) {
      console.log('  ' + chalk.red('No available versions found. Run pvm update.'));
    } else {
      const max = 50;
      const shownVersions = availableVersions.slice(0, max);
      for (const version of shownVersions) {
        let repr = version;
        if (version === localVersion) repr = chalk.blue(version + ' (local)');
        else if (version === globalVersion) repr = chalk.green(version + ' (global)');
        console.log('  ' + repr);
      }
      if (availableVersions.length > max) {
        console.log(`  ... and ${availableVersions.length - max} more versions`);
      }
    }
  } catch (error) {
    logger.error(chalk.red(`Failed to list versions: ${(error as Error).message}`));
  }
}
