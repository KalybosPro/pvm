import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ensureDirs } from '../utils/fs';
import { VERSIONS_DIR, HOME } from '../constants';

export function install(version: string): void {
  ensureDirs();

  const versionDir = path.join(VERSIONS_DIR, version);
  if (fs.existsSync(versionDir)) {
    console.log(`PHP ${version} is already installed.`);
    return;
  }

  let phpBuildPath = '';

  try {
    phpBuildPath = execSync('command -v php-build').toString().trim();
  } catch {
    const userPhpBuild = path.join(HOME, '.php-build', 'bin', 'php-build');
    if (fs.existsSync(userPhpBuild)) {
      phpBuildPath = userPhpBuild;
    } else {
      console.error('php-build is not installed. Install with:\n   git clone https://github.com/php-build/php-build ~/.php-build');
      process.exit(1);
    }
  }

  console.log(`Installing PHP ${version} using php-build...`);
  try {
    execSync(`${phpBuildPath} ${version} ${versionDir}`, { stdio: 'inherit' });
    console.log(`PHP ${version} installed at ${versionDir}.`);
  } catch (err: any) {
    console.error(`Failed to install PHP ${version}: ${err.message}`);
  }
}
