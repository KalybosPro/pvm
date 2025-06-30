"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const help_1 = require("../src/commands/help");
describe('help', () => {
    it('should print help message', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        (0, help_1.help)();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
        consoleSpy.mockRestore();
    });
});
