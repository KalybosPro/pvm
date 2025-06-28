#!/usr/bin/env node

// pvm.js - PHP Version Manager CLI (global)

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

const HOME = process.env.HOME || process.env.USERPROFILE;
const PVM_DIR = path.join(HOME, '.pvm');
const VERSIONS_DIR = path.join(PVM_DIR, 'versions');
const CONFIG_FILE = '.pvmrc';

function ensurePvmDirs() {
  if (!fs.existsSync(PVM_DIR)) fs.mkdirSync(PVM_DIR);
  if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR);
}

function install(version) {
  if (os.platform() === 'win32') {
    installWindows(version);
  } else {
    installUnix(version);
  }
}

function installUnix(version) {
  ensurePvmDirs();
  const versionDir = path.join(VERSIONS_DIR, version);
  if (fs.existsSync(versionDir)) {
    console.log(`✅ PHP ${version} is already installed.`);
    return;
  }

  const url = `https://www.php.net/distributions/php-${version}.tar.gz`;
  console.log(`⬇️ Downloading PHP ${version} sources from ${url}`);

  // Use system temp dir instead of current project
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `php-${version}-`));
  process.chdir(tmpDir);

  try {
    execSync(`curl -L ${url} -o php-${version}.tar.gz`, { stdio: 'inherit' });
    execSync(`tar -xzf php-${version}.tar.gz`, { stdio: 'inherit' });
    process.chdir(`php-${version}`);

    console.log(`⚙️ Configuring PHP ${version}...`);

    // Detect iconv prefix for macOS Homebrew
    let iconvPrefix = '';
    try {
      const brewPrefix = execSync('brew --prefix libiconv').toString().trim();
      iconvPrefix = `--with-iconv=${brewPrefix}`;
    } catch {
      console.warn('⚠️ libiconv not found via brew. Please ensure it is installed.');
    }

    execSync(`./configure --prefix=${versionDir} ${iconvPrefix}`, { stdio: 'inherit' });

    console.log(`🔨 Compiling PHP ${version}...`);
    execSync(`make -j$(nproc)`, { stdio: 'inherit' });
    execSync(`make install`, { stdio: 'inherit' });

    console.log(`✅ PHP ${version} installed at ${versionDir}.`);
  } catch (err) {
    console.error(`❌ Failed to install PHP ${version}: ${err.message}`);
  } finally {
    // Clean up temp files
    process.chdir(os.homedir()); // avoid deleting while inside
    execSync(`rm -rf ${tmpDir}`, { stdio: 'inherit' });
  }
}


function installWindows(version) {
  ensurePvmDirs();
  const versionDir = path.join(VERSIONS_DIR, version);
  if (fs.existsSync(versionDir)) {
    console.log(`✅ PHP ${version} is already installed.`);
    return;
  }

  const url = getWindowsDownloadUrl(version);
  console.log(`⬇️ Downloading PHP ${version} from ${url}`);

  try {
    execSync(`curl -L ${url} -o php-${version}.zip`, { stdio: 'inherit' });
    execSync(`powershell Expand-Archive php-${version}.zip ${versionDir}`, { stdio: 'inherit' });
    execSync(`del php-${version}.zip`, { stdio: 'inherit' });

    console.log(`✅ PHP ${version} installed at ${versionDir}.`);
  } catch (err) {
    console.error(`❌ Failed to install PHP ${version}: ${err.message}`);
  }
}

function getWindowsDownloadUrl(version) {
  console.log(`🔍 Searching for PHP ${version} Windows download URL...`);
  const page = execSync(`curl -s https://windows.php.net/downloads/releases/archives/`).toString();
  const regex = new RegExp(`href="(/downloads/releases/archives/php-${version}.*x64.zip)"`);
  const match = page.match(regex);

  if (match) {
    const url = `https://windows.php.net${match[1]}`;
    console.log(`✅ Found: ${url}`);
    return url;
  } else {
    throw new Error(`PHP ${version} not found on windows.php.net`);
  }
}

function useVersion(version) {
  const versionDir = path.join(VERSIONS_DIR, version);
  if (!fs.existsSync(versionDir)) {
    console.error(`❌ PHP ${version} is not installed. Run: pvm install ${version}`);
    process.exit(1);
  }

  fs.writeFileSync(CONFIG_FILE, `php=${version}\n`);
  console.log(`📌 Project now uses PHP ${version}`);
}

function current() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('ℹ️  No .pvmrc file found.');
    return;
  }
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const match = content.match(/php=(.+)/);
  if (match) {
    console.log(`🔧 Current PHP version: ${match[1]}`);
  } else {
    console.log('⚠️  Malformed .pvmrc file.');
  }
}

function execCmd(cmdArgs) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ No .pvmrc file found. Use \"pvm use <version>\" first.');
    process.exit(1);
  }
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const match = content.match(/php=(.+)/);
  if (!match) {
    console.error('❌ Malformed .pvmrc file.');
    process.exit(1);
  }
  const version = match[1];

  // MacOS Brew PHP path example
  const phpBin = `/opt/homebrew/bin/php@${version}`;
  if (!fs.existsSync(phpBin)) {
    console.error(`❌ PHP binary not found for version ${version}. Please install it via brew: brew install php@${version}`);
    process.exit(1);
  }

  const result = spawnSync(phpBin, cmdArgs, { stdio: 'inherit' });
  process.exit(result.status);
}


function listVersions() {
  ensurePvmDirs();
  const versions = fs.readdirSync(VERSIONS_DIR);
  if (!versions.length) {
    console.log('📭 No PHP versions installed yet.');
    return;
  }
  console.log('📦 Installed versions:');
  for (const v of versions) {
    console.log(` - ${v}`);
  }
}

function uninstall(version) {
  const versionDir = path.join(VERSIONS_DIR, version);
  if (!fs.existsSync(versionDir)) {
    console.error(`❌ PHP ${version} is not installed.`);
    process.exit(1);
  }

  try {
    fs.rmSync(versionDir, { recursive: true, force: true });
    console.log(`🗑️ PHP ${version} uninstalled successfully.`);
  } catch (err) {
    console.error(`❌ Failed to uninstall PHP ${version}: ${err.message}`);
    process.exit(1);
  }
}


function help() {
  console.log(`\n🧰 PVM - PHP Version Manager (like FVM)

Usage:
  pvm install <version>        Install a PHP version
  pvm uninstall <version>      Uninstall a PHP version
  pvm use <version>            Use a PHP version for this project
  pvm current                  Show current project PHP version
  pvm exec <args...>           Execute a command using current version
  pvm list                     List installed PHP versions
  pvm help                     Show this help
`);
}


// CLI Dispatcher
const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'install':
    install(args[0]);
    break;
  case 'use':
    useVersion(args[0]);
    break;
  case 'current':
    current();
    break;
  case 'exec':
    execCmd(args);
    break;
  case 'list':
    listVersions();
    break;
  case 'uninstall':
    uninstall(args[0]);
    break;
  case 'help':
  default:
    help();
    break;
}
