import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ConfigManager } from '../config/configManager';

jest.mock('fs-extra');

const fakePvmDir = path.join(os.homedir(), '.pvm');
const fakeConfigPath = path.join(fakePvmDir, 'config.json');

describe('ConfigManager', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should load and save global config', async () => {
    (fs.pathExists as jest.Mock).mockResolvedValue(true);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ pvmDir: fakePvmDir }));
    const configManager = ConfigManager.getInstance();
    await configManager.loadGlobalConfig();
    expect(configManager.getGlobal('pvmDir')).toEqual(fakePvmDir);

    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    await configManager.setGlobal('mirrorUrl', 'https://mirror.example.com');
    expect(configManager.getGlobal('mirrorUrl')).toEqual('https://mirror.example.com');
  });

  it('should handle missing config file gracefully', async () => {
    (fs.pathExists as jest.Mock).mockResolvedValue(false);
    const configManager = ConfigManager.getInstance();
    await configManager.loadGlobalConfig();
    expect(configManager.getGlobal('pvmDir')).toBeUndefined();
  });

  it('should load and save local config with text format', async () => {
    const localConfigPath = path.join(process.cwd(), '.pvmrc');
    (fs.pathExists as jest.Mock).mockImplementation(async (p) => p === localConfigPath);
    (fs.readFile as jest.Mock).mockImplementation(async (p) => '8.2.5');
    const configManager = ConfigManager.getInstance();
    await configManager.loadLocalConfig();

    expect(configManager.getLocal('localVersion')).toEqual('8.2.5');

    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    await configManager.setLocal('localVersion', '8.1.17');
    expect(configManager.getLocal('localVersion')).toEqual('8.1.17');
  });

  it('should emit change events on save', async () => {
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const configManager = ConfigManager.getInstance();
    const changeHandler = jest.fn();
    configManager.on('change', changeHandler);

    await configManager.setGlobal('pvmDir', '/tmp/pvmdir');
    expect(changeHandler).toHaveBeenCalledWith('global', expect.any(Object));
  });
});
