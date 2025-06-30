export function help(): void {
  console.log(`
🧰 PVM - PHP Version Manager (like FVM or NVM)

Usage:
  pvm install <version>        Install a PHP version via php-build
  pvm uninstall <version>      Uninstall a PHP version
  pvm use <version>            Use a PHP version for this project (.pvmrc)
  pvm current                  Show current project PHP version
  pvm env                      Output export command for PATH (eval "$(pvm env)")
  pvm exec <args...>           Execute a command using current version
  pvm list                     List installed PHP versions
  pvm help                     Show this help

Example:
  pvm install 8.2.20
  pvm use 8.2.20
  eval "$(pvm env)"
  php -v
`);
}
