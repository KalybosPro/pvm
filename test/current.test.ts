import fs from 'fs';
import { current } from '../src/commands/current';
import { CONFIG_FILE } from '../src/constants';

describe('current', () => {
  it('should display current PHP version', () => {
    fs.writeFileSync(CONFIG_FILE, 'php=8.2.20\n');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    current();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('8.2.20'));
    consoleSpy.mockRestore();
  });
});
