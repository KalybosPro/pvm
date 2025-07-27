import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import logger from '../utils/logger';

export default async function phpCommand(args: string[]): Promise<void> {
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
        logger.error(chalk.red('No .pvmrc found in this project or parent folders.'));
        process.exit(1);
    }

    const version = await readLocalVersion(projectRoot);
    if (!version) {
        logger.error(chalk.red('Invalid .pvmrc (missing PHP version).'));
        process.exit(1);
    }

    const phpPath = perfectPath(version);
    if (!await fs.pathExists(phpPath)) {
        logger.error(chalk.red(`PHP version ${version} not installed at ${phpPath}`));
        process.exit(1);
    }

    // Launch the PHP binary with provided arguments
    const child = spawn(phpPath, args, { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code ?? 0));
}

async function findProjectRoot(): Promise<string | null> {
    let dir = process.cwd();
    while (dir !== path.dirname(dir)) {
        const configPath = path.join(dir, '.pvmrc');
        if (await fs.pathExists(configPath)) return dir;
        dir = path.dirname(dir);
    }
    return null;
}

async function readLocalVersion(root: string): Promise<string | null> {
    const content = await fs.readFile(path.join(root, '.pvmrc'), 'utf-8');
    const trimmed = content.trim();
    return trimmed || null;
}

function perfectPath(v: string): string {
    let p = '';
    if (process.platform === 'win32') {
        p = path.join(os.homedir(), '.pvm', 'versions', v, 'php.exe');
    } else {
        p = path.join(os.homedir(), '.pvm', 'versions', v, 'php');
    }

    return p;
}