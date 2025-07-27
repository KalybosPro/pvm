import chalk from 'chalk';
import { prompt } from 'enquirer';
import logger from '../utils/logger';
import { ConfigManager, GlobalConfig } from '../config/configManager';

export default async function configCommand(): Promise<void> {
  try {
    const configManager = ConfigManager.getInstance();

    const currentConfig = configManager.getAll();

    const responses = await prompt<GlobalConfig>([
      {
        type: 'input',
        name: 'pvmDir',
        message: 'Directory to store PHP versions and configs:',
        initial: currentConfig.pvmDir || '',
      },
      {
        type: 'input',
        name: 'mirrorUrl',
        message: 'URL of the mirror to download releases:',
        initial: currentConfig.mirrorUrl || 'https://www.php.net/distributions',
      },
      {
        type: 'select',
        name: 'updatePolicy',
        message: 'Update policy for manifest cache:',
        choices: ['always', 'daily', 'never'],
        initial:
          currentConfig.updatePolicy === 'always' ? 0 : currentConfig.updatePolicy === 'daily' ? 1 : 2,
      },
    ]);

    await configManager.updateConfig({
      pvmDir: responses.pvmDir,
      mirrorUrl: responses.mirrorUrl,
      updatePolicy: responses.updatePolicy,
    });

    logger.info(chalk.green('Configuration updated successfully.'));
  } catch (error) {
    logger.error(chalk.red(`Failed to configure pvm: ${(error as Error).message}`));
  }
}
