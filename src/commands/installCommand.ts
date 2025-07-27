import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { ManifestManager } from '../core/manifestManager';
import { DownloadManager } from '../core/downloadManager';
import { VersionsManager } from '../core/versionsManager';
import logger from '../utils/logger';
import { getPvmDir } from '../utils/fileHelpers';
import { getFullVersion, getPhpDownloadUrl, validateVersionSyntax } from '../utils/versionHelpers';

function getVersionInstallPath(version: string): string {
  return path.join(getPvmDir(), 'versions', version);
}

async function restoreFilePermissions(targetDir: string): Promise<void> {
  // Recursive chmod 755 for directories, 644 for files except executables 755
  const entries = await fs.readdir(targetDir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        await fs.chmod(fullPath, 0o755);
        await restoreFilePermissions(fullPath);
      } else {
        let mode = 0o644;
        const ext = path.extname(entry.name).toLowerCase();
        if (
          ext === '' ||
          ext === '.sh' ||
          ext === '.exe' ||
          (process.platform !== 'win32' && (await fs.stat(fullPath)).mode & 0o111)
        ) {
          mode = 0o755;
        }
        await fs.chmod(fullPath, mode);
      }
    })
  );
}

export default async function installCommand(version?: string): Promise<void> {
  if (!version) {
    logger.error(chalk.red('Please specify a PHP version to install.'));
    process.exit(1);
  }
  if (!validateVersionSyntax(version)) {
    logger.error(chalk.red(`Invalid version syntax: ${version}`));
    process.exit(1);
  }

  const spinner = ora('Retrieving manifest...').start();

  try {
    const manifestManager = new ManifestManager();
    await manifestManager.loadManifest();

    const platform = os.platform();
    const arch = os.arch();

    const binaryUrl = manifestManager.getBinaryUrl(version, platform, arch);
    // const binaryUrl = await getPhpDownloadUrl(version);
    if (!binaryUrl) {
      spinner.fail(`No binary found for version ${version} on ${platform} ${arch}.`);
      process.exit(1);
    }

    spinner.text = `Downloading PHP ${version}...`;

    const downloadManager = new DownloadManager();
    const archivePath = path.join(getPvmDir(), 'tmp', `php-${version}.${platform === 'win32' ? 'zip' : 'tar.gz'}`);

    await fs.ensureDir(path.dirname(archivePath));

    // Resume download if interrupted
    await downloadManager.downloadWithResume(binaryUrl, archivePath, spinner);

    spinner.text = 'Verifying checksum...';
    const expectedChecksum = manifestManager.getChecksum(version, platform, arch);
    const isValid = await downloadManager.verifyChecksum(archivePath, expectedChecksum);
    if (!isValid) {
      spinner.fail('Checksum verification failed.');
      await fs.remove(archivePath);
      process.exit(1);
    }

    spinner.text = 'Extracting archive...';

    const installPath = getVersionInstallPath(version);
    await fs.ensureDir(installPath);
    await fs.emptyDir(installPath);

    await downloadManager.extractArchive(archivePath, installPath);

    await restoreFilePermissions(installPath);

    spinner.text = 'Updating versions metadata...';
    const versionsManager = new VersionsManager();
    await versionsManager.addVersion(version);

    spinner.succeed(chalk.green(`PHP ${version} installed successfully.`));

    await fs.remove(archivePath);
  } catch (error) {
    spinner.fail(chalk.red(`Installation failed: ${(error as Error).message}`));
    logger.error(`Stack trace: ${(error as Error).stack}`);
    process.exit(1);
  }
}
