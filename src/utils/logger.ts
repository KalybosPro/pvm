import chalk from 'chalk';

class Logger {
  level: 'debug' | 'info' | 'warn' | 'error' = 'info';

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string): void {
    if (['info', 'debug'].includes(this.level)) {
      console.log(chalk.blue(`[${this.getTimestamp()}] [INFO] ${message}`));
    }
  }

  warn(message: string): void {
    if (['warn', 'info', 'debug'].includes(this.level)) {
      console.warn(chalk.yellow(`[${this.getTimestamp()}] [WARN] ${message}`));
    }
  }

  error(message: string): void {
    if (['error', 'warn', 'info', 'debug'].includes(this.level)) {
      console.error(chalk.red(`[${this.getTimestamp()}] [ERROR] ${message}`));
    }
  }

  debug(message: string): void {
    if (this.level === 'debug') {
      console.log(chalk.gray(`[${this.getTimestamp()}] [DEBUG] ${message}`));
    }
  }

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.level = level;
  }
}

const logger = new Logger();
export default logger;
