import fs from 'fs';
import path from 'path';
import * as child_process from 'child_process';
import { install } from '../src/commands/install';
import { VERSIONS_DIR } from '../src/constants';

jest.mock('child_process');
const execSyncMock = child_process.execSync as jest.Mock;

describe('install', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  });

  it('should install PHP version using php-build', () => {
    const version = '8.2.20';
    const versionDir = path.join(VERSIONS_DIR, version);

    if (fs.existsSync(versionDir)) fs.rmSync(versionDir, { recursive: true });

    execSyncMock.mockImplementation((cmd: string) => {
      if (cmd.includes('command -v php-build')) return '/usr/local/bin/php-build\n';
      if (cmd.includes('php-build')) return '';
      return '';
    });

    install(version);

    expect(execSyncMock).toHaveBeenCalledWith(expect.stringContaining('php-build'), expect.any(Object));
  });

  it('should not install if version already exists', () => {
    const version = '8.2.21';
    const versionDir = path.join(VERSIONS_DIR, version);
    fs.mkdirSync(versionDir, { recursive: true });

    install(version);

    expect(execSyncMock).not.toHaveBeenCalledWith(expect.stringContaining('php-build'), expect.any(Object));
  });
});
