// pvm.js - PHP Version Manager CLI (global)

//  #!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const HOME = process.env.HOME || process.env.USERPROFILE;
const PVM_DIR = path.join(HOME, '.pvm');
const VERSIONS_DIR = path.join(PVM_DIR, 'versions');
const CONFIG_FILE = '.pvmrc';

function ensurePvmDirs() {
  if (!fs.existsSync(PVM_DIR)) fs.mkdirSync(PVM_DIR);
  if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR);
}

function install(version) {
  ensurePvmDirs();
  const versionDir = path.join(VERSIONS_DIR, version);
  if (fs.existsSync(versionDir)) {
    console.log(`✅ PHP ${version} is already installed.`);
    return;
  }

  console.log(`⬇️ Installing PHP ${version} (simulated)...`);
  fs.mkdirSync(versionDir, { recursive: true });
  const phpPath = path.join(versionDir, 'php');
  fs.writeFileSync(phpPath, `#!/bin/bash\necho PHP ${version}`);
  fs.chmodSync(phpPath, 0o755);
  console.log(`✅ PHP ${version} installed.`);
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
    console.error('❌ No .pvmrc file found. Use "pvm use <version>" first.');
    process.exit(1);
  }
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const match = content.match(/php=(.+)/);
  if (!match) {
    console.error('❌ Malformed .pvmrc file.');
    process.exit(1);
  }
  const version = match[1];
  const phpBin = path.join(VERSIONS_DIR, version, 'php');

  if (!fs.existsSync(phpBin)) {
    console.error(`❌ PHP binary not found for version ${version}.`);
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

function help() {
  console.log(`\n🧰 PVM - PHP Version Manager (like FVM)

Usage:
  pvm install <version>        Install a PHP version
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
  case 'help':
  default:
    help();
    break;
}
