import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import EventEmitter from 'events';
import { writeJsonAtomic, readJsonAtomic, getPvmDir } from '../utils/fileHelpers';
import logger from '../utils/logger';

interface GlobalConfig {
  pvmDir?: string;
  mirrorUrl?: string;
  updatePolicy?: 'always' | 'daily' | 'never';
  globalVersion?: string;
}

interface LocalConfig {
  localVersion?: string;
}

class ConfigManager extends EventEmitter {
  private static instance: ConfigManager;

  private globalConfigPath: string;
  private globalConfig: GlobalConfig = {};

  private localConfigPath?: string;
  private localConfig: LocalConfig = {};

  private constructor() {
    super();
    const baseDir = getPvmDir();
    this.globalConfigPath = path.join(baseDir, 'config.json');
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadGlobalConfig(): Promise<void> {
    try {
      if (await fs.pathExists(this.globalConfigPath)) {
        this.globalConfig = await readJsonAtomic<GlobalConfig>(this.globalConfigPath);
      } else {
        this.globalConfig = {};
      }
    } catch (error) {
      logger.warn(`Unable to read global config: ${(error as Error).message}`);
      this.globalConfig = {};
    }
  }

  async saveGlobalConfig(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.globalConfigPath));
      await writeJsonAtomic(this.globalConfigPath, this.globalConfig, { spaces: 2 });
      this.emit('change', 'global', this.globalConfig);
    } catch (error) {
      logger.error(`Unable to save global config: ${(error as Error).message}`);
      throw error;
    }
  }

  getGlobal<T extends keyof GlobalConfig>(key: T): GlobalConfig[T] | undefined {
    return this.globalConfig[key];
  }

  async setGlobal<T extends keyof GlobalConfig>(key: T, value: GlobalConfig[T]): Promise<void> {
    this.globalConfig[key] = value;
    await this.saveGlobalConfig();
  }

  async updateConfig(data: Partial<GlobalConfig>): Promise<void> {
    Object.assign(this.globalConfig, data);
    await this.saveGlobalConfig();
  }

  // Local config

  async loadLocalConfig(baseDir?: string): Promise<void> {
    if (!baseDir) baseDir = process.cwd();
    try {
      const localConfigFile = path.join(baseDir, '.pvmrc');
      this.localConfigPath = localConfigFile;
      if (await fs.pathExists(localConfigFile)) {
        const content = await fs.readFile(localConfigFile, 'utf-8');
        try {
          // Try JSON parse
          const parsed = JSON.parse(content);
          this.localConfig = parsed;
        } catch {
          // Fallback to text with version only
          this.localConfig = { localVersion: content.trim() };
        }
      } else {
        this.localConfig = {};
      }
    } catch (error) {
      logger.warn(`Unable to read local config: ${(error as Error).message}`);
      this.localConfig = {};
    }
  }

  async saveLocalConfig(): Promise<void> {
    if (!this.localConfigPath) {
      throw new Error('Local config path not set');
    }
    try {
      if (Object.keys(this.localConfig).length === 1 && typeof this.localConfig.localVersion === 'string') {
        // Save as text-only file for simplicity
        await fs.writeFile(this.localConfigPath, this.localConfig.localVersion + os.EOL, 'utf-8');
      } else {
        await writeJsonAtomic(this.localConfigPath, this.localConfig, { spaces: 2 });
      }
      this.emit('change', 'local', this.localConfig);
    } catch (error) {
      logger.error(`Unable to save local config: ${(error as Error).message}`);
      throw error;
    }
  }

  getLocal<T extends keyof LocalConfig>(key: T): LocalConfig[T] | undefined {
    return this.localConfig[key];
  }

  async setLocal<T extends keyof LocalConfig>(key: T, value: LocalConfig[T]): Promise<void> {
    this.localConfig[key] = value;
    await this.saveLocalConfig();
  }

  getAll(): GlobalConfig & LocalConfig {
    return { ...this.globalConfig, ...this.localConfig };
  }

}

export const loadGlobalConfig = async (): Promise<void> => {
  const mgr = ConfigManager.getInstance();
  await mgr.loadGlobalConfig();
};

export const loadLocalConfig = async (): Promise<void> => {
  const mgr = ConfigManager.getInstance();
  await mgr.loadLocalConfig();
};

export { ConfigManager, GlobalConfig, LocalConfig };
