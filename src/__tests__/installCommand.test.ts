import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import installCommand from '../commands/installCommand';
import { VersionsManager } from '../core/versionsManager';
import { ManifestManager } from '../core/manifestManager';
import { DownloadManager } from '../core/downloadManager';

jest.mock('fs-extra');

describe('installCommand', () => {
  const version = '8.2.5';

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.spyOn(ManifestManager.prototype, 'loadManifest').mockResolvedValue(undefined);
    jest.spyOn(ManifestManager.prototype, 'getBinaryUrl').mockReturnValue('http://fakeurl.com/php.zip');
    jest.spyOn(ManifestManager.prototype, 'getChecksum').mockReturnValue('abc123');

    jest.spyOn(DownloadManager.prototype, 'downloadWithResume').mockResolvedValue(undefined);
    jest.spyOn(DownloadManager.prototype, 'verifyChecksum').mockResolvedValue(true);
    jest.spyOn(DownloadManager.prototype, 'extractArchive').mockResolvedValue(undefined);

    jest.spyOn(VersionsManager.prototype, 'addVersion').mockResolvedValue(undefined);

    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.emptyDir as jest.Mock).mockResolvedValue(undefined);
    (fs.remove as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ mode: 0o755 });
    (fs.readdir as jest.Mock).mockResolvedValue([]);
  });

  it('should install a valid PHP version', async () => {
    await expect(installCommand(version)).resolves.not.toThrow();
    expect(ManifestManager.prototype.loadManifest).toHaveBeenCalled();
    expect(DownloadManager.prototype.downloadWithResume).toHaveBeenCalled();
    expect(DownloadManager.prototype.extractArchive).toHaveBeenCalled();
    expect(VersionsManager.prototype.addVersion).toHaveBeenCalledWith(version);
  });

  it('should reject invalid version syntax', async () => {
    const invalidVersion = 'invalid_version';
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit called'); });
    await expect(installCommand(invalidVersion)).rejects.toThrow('process.exit called');
    exitSpy.mockRestore();
  });
});
