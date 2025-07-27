import path from 'path';
import os from 'os';
import useCommand from '../commands/useCommand';
import { VersionsManager } from '../core/versionsManager';
import { ConfigManager } from '../config/configManager';
import { PathManager } from '../core/pathManager';

jest.mock('../core/versionsManager');
jest.mock('../config/configManager');
jest.mock('../core/pathManager');

describe('useCommand', () => {
  const version = '8.2.5';

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.spyOn(VersionsManager.prototype, 'isVersionInstalled').mockResolvedValue(true);

    (ConfigManager.getInstance as jest.Mock).mockReturnValue({
      setGlobal: jest.fn().mockResolvedValue(undefined),
    });

    jest.spyOn(PathManager.prototype, 'addPathPersistently').mockImplementation(async () => { });
    jest.spyOn(PathManager.prototype, 'addTemporaryPath').mockImplementation(() => { });
  });


  it('should use a version permanently', async () => {
    await expect(useCommand(version, { temporary: false })).resolves.not.toThrow();
    expect(ConfigManager.getInstance().setGlobal).toHaveBeenCalledWith('globalVersion', version);
    expect(PathManager.prototype.addPathPersistently).toHaveBeenCalled();
  });

  it('should use a version temporarily', async () => {
    await expect(useCommand(version, { temporary: true })).resolves.not.toThrow();
    expect(PathManager.prototype.addTemporaryPath).toHaveBeenCalled();
  });

  it('should error if version not installed', async () => {
    jest.spyOn(VersionsManager.prototype, 'isVersionInstalled').mockResolvedValue(false);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit called'); });
    await expect(useCommand(version, {})).rejects.toThrow('process.exit called');
    exitSpy.mockRestore();
  });

});
