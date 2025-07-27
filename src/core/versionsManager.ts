import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { getPvmDir, readJsonAtomic, writeJsonAtomic } from '../utils/fileHelpers';
import logger from '../utils/logger';

const versionsFile = path.join(getPvmDir(), 'versions.json');

export class VersionsManager {
  private installedVersions: string[] = [];

  constructor() {}

  private async _loadVersions(): Promise<void> {
    try {
      if (await fs.pathExists(versionsFile)) {
        this.installedVersions = await readJsonAtomic<string[]>(versionsFile);
      } else {
        this.installedVersions = [];
      }
    } catch (error) {
      logger.error(`Failed to load versions list: ${(error as Error).message}`);
      this.installedVersions = [];
    }
  }

  private async _saveVersions(): Promise<void> {
    try {
      await writeJsonAtomic(versionsFile, this.installedVersions, { spaces: 2 });
    } catch (error) {
      logger.error(`Failed to save versions list: ${(error as Error).message}`);
    }
  }

  async listVersions(): Promise<string[]> {
    await this._loadVersions();
    return [...this.installedVersions];
  }

  async addVersion(version: string): Promise<void> {
    await this._loadVersions();
    if (!this.installedVersions.includes(version)) {
      this.installedVersions.push(version);
      await this._saveVersions();
    }
  }

  async removeVersion(version: string): Promise<void> {
    await this._loadVersions();
    const index = this.installedVersions.indexOf(version);
    if (index !== -1) {
      this.installedVersions.splice(index, 1);
      await this._saveVersions();
    }
  }

  async isVersionInstalled(version: string): Promise<boolean> {
    await this._loadVersions();
    return this.installedVersions.includes(version);
  }
}
