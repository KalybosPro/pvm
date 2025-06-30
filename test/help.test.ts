import { help } from '../src/commands/help';

describe('help', () => {
  it('should print help message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    help();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    consoleSpy.mockRestore();
  });
});
