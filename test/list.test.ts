import fs from 'fs';
import path from 'path';
import { list } from '../src/commands/list';
import { VERSIONS_DIR, CONFIG_FILE } from '../src/constants';

describe('list', () => {
  beforeAll(() => {
    if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });
    fs.mkdirSync(path.join(VERSIONS_DIR, '8.2.20'), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, 'php=8.2.20\n');
  });

  it('should list installed versions and highlight current', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    list();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('(current)'));
    consoleSpy.mockRestore();
  });
});
