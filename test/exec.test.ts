import fs from 'fs';
import path from 'path';
import * as child_process from 'child_process';
import { execPhp } from '../src/commands/exec';
import { CONFIG_FILE, VERSIONS_DIR } from '../src/constants';

jest.mock('child_process');
const spawnSyncMock = child_process.spawnSync as jest.Mock;

describe('exec', () => {
  const version = '8.2.20';
  const phpPath = path.join(VERSIONS_DIR, version, 'bin', 'php');

  beforeAll(() => {
    fs.writeFileSync(CONFIG_FILE, `php=${version}\n`);
    fs.mkdirSync(path.dirname(phpPath), { recursive: true });
    fs.writeFileSync(phpPath, '');
  });

  it('should call spawnSync with php binary', () => {
    spawnSyncMock.mockReturnValue({ status: 0 });

    execPhp(['-v']);

    expect(spawnSyncMock).toHaveBeenCalledWith(phpPath, ['-v'], { stdio: 'inherit' });
  });
});
