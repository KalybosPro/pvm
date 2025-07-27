import axios from 'axios';
import os from 'os';
import fs from 'fs-extra';
import { ManifestManager } from '../core/manifestManager'; // adapte le chemin selon ton projet
import logger from '../utils/logger';
import { writeJsonAtomic } from '../utils/fileHelpers';
import * as fileHelpers from '../utils/fileHelpers';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('os');
jest.mock('fs-extra');
jest.mock('../utils/logger', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));
jest.mock('../utils/fileHelpers', () => ({
    getPvmDir: jest.fn(() => '/mocked/path'),
    writeJsonAtomic: jest.fn(),
}));
jest.spyOn(fileHelpers, 'getPvmDir').mockReturnValue('/mocked/path');

describe('ManifestManager.updateManifest', () => {
    let pvm: ManifestManager;

    beforeEach(() => {
        pvm = new ManifestManager();
        jest.clearAllMocks();
    });

    it('should update manifest for Windows platform', async () => {
        jest.spyOn(os, 'platform').mockReturnValue('win32');
        jest.spyOn(os, 'arch').mockReturnValue('x64');

        const mockData = {
            '8.2.0': {
                version: '8.2.0',
                source: {
                    path: 'php-8.2.0.tar.gz',
                    size: '1000000',
                },
                test_pack: {
                    path: 'php-8.2.0-tests.zip',
                    size: '200000',
                    sha256: 'abcd',
                },
                'nts-vs16-x64': {
                    mtime: '1234567890',
                    zip: {
                        path: 'php-8.2.0-nts-Win32-vs16-x64.zip',
                        size: '50000000',
                        sha256: 'sha256windows',
                    },
                    debug_pack: {
                        path: 'php-debug.zip',
                        size: '10000000',
                        sha256: 'debugsha',
                    },
                    devel_pack: {
                        path: 'php-devel.zip',
                        size: '5000000',
                        sha256: 'develsha',
                    },
                },
            },
            '8.4.0': {
                version: '8.4.0',
                source: {
                    path: 'php-8.4.0.tar.gz',
                    size: '1000000',
                },
                test_pack: {
                    path: 'php-8.4.0-tests.zip',
                    size: '200000',
                    sha256: 'abcd',
                },
                'nts-vs16-x64': {
                    mtime: '1234567890',
                    zip: {
                        path: 'php-8.4.0-nts-Win32-vs16-x64.zip',
                        size: '50000000',
                        sha256: 'sha256windows',
                    },
                    debug_pack: {
                        path: 'php-debug.zip',
                        size: '10000000',
                        sha256: 'debugsha',
                    },
                    devel_pack: {
                        path: 'php-devel.zip',
                        size: '5000000',
                        sha256: 'develsha',
                    },
                },
            },
        };

        mockedAxios.get.mockResolvedValue({ data: mockData });

        await pvm.updateManifest();

        expect(mockedAxios.get).toHaveBeenCalledWith('https://windows.php.net/downloads/releases/releases.json');
        expect(writeJsonAtomic).toHaveBeenCalled();

        const manifestArg = (writeJsonAtomic as jest.Mock).mock.calls[0][1];

        expect(manifestArg.entries[0].version).toBe('8.2.0');
        expect(manifestArg.entries[0].platforms['win32-x64']).toEqual({
            url: 'https://windows.php.net/downloads/releases/php-8.2.0-nts-Win32-vs16-x64.zip',
            checksum: 'sha256windows',
            archiveType: 'zip',
        });

        expect(logger.info).toHaveBeenCalledWith('Manifest updated successfully.');
    });

    it('should update manifest for Linux platform', async () => {
        jest.spyOn(os, 'platform').mockReturnValue('linux');
        jest.spyOn(os, 'arch').mockReturnValue('x64');


        const mockData = {
            '8.2.0': {
                version: '8.2.0',
                source: {
                    path: 'php-8.2.0.tar.gz',
                    size: '1000000',
                },
                test_pack: {
                    path: 'php-8.2.0-tests.zip',
                    size: '200000',
                    sha256: 'abcd',
                },
            },
        };

        mockedAxios.get.mockResolvedValue({ data: mockData });

        await pvm.updateManifest();

        expect(axios.get).toHaveBeenCalledWith('https://www.php.net/releases/index.php?json');
        expect(writeJsonAtomic).toHaveBeenCalled();

        const manifestArg = (writeJsonAtomic as jest.Mock).mock.calls[0][1];

        expect(manifestArg.entries[0].version).toBe('8.2.0');
        expect(manifestArg.entries[0].platforms['linux-x64']).toEqual({
            url: 'https://www.php.net/distributions/php-8.2.0.tar.gz',
            checksum: '',
            archiveType: 'tar.gz',
        });

        expect(logger.info).toHaveBeenCalledWith('Manifest updated successfully.');
    });

    it('should handle errors gracefully', async () => {
        jest.spyOn(os, 'platform').mockReturnValue('linux');
        jest.spyOn(os, 'arch').mockReturnValue('Network error');


        try {
            await expect(pvm.updateManifest()).rejects.toThrow('Network error');
        } catch (e) {
            logger.error(`Failed to update manifest: ${(e as Error).message}`);
            throw e;
        }

        expect(logger.error).toHaveBeenCalledWith('Failed to update manifest: Network error');
    });
});
