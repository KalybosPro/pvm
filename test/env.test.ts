import fs from 'fs';
import path from 'path';
import { env } from '../src/commands/env';
import { CONFIG_FILE, VERSIONS_DIR } from '../src/constants';

describe('env', () => {
  const version = '8.2.20';
  const binDir = path.join(VERSIONS_DIR, version, 'bin');

  beforeAll(() => {
    fs.writeFileSync(CONFIG_FILE, `php=${version}\n`);
    fs.mkdirSync(binDir, { recursive: true });
  });

  it('should output export PATH command', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    env();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('export PATH'));
    consoleSpy.mockRestore();
  });
});
