import fs from 'fs';
import path from 'path';
import promptSync from 'prompt-sync';
import { uninstall } from '../src/commands/uninstall';
import { VERSIONS_DIR } from '../src/constants';

jest.mock('prompt-sync');

const promptMock = jest.fn(() => 'y');
(promptSync as jest.Mock).mockReturnValue(promptMock);

describe('uninstall', () => {
  const version = '8.2.20';
  const versionDir = path.join(VERSIONS_DIR, version);

  beforeAll(() => {
    if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });
  });

  it('should uninstall PHP version if confirmed', () => {
    uninstall(version);
    expect(fs.existsSync(versionDir)).toBe(false);
  });
});
