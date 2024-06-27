import readline from 'readline';
import { spawn } from 'child_process';
import os from 'os';
import { DokoJSLogger } from './logger/logger';

const ERROR_CODES = {
  SNARK_VM_ERROR: 'ECLI0377010'
};

export const getUserShell = () => {
  return process.env.SHELL || (isWindows() ? 'powershell' : '/bin/sh');
};

export const isWindows = () => {
  return os.platform() === 'win32';
};

export const isMacOS = () => {
  return os.platform() === 'darwin';
};

export const isLinux = () => {
  return os.platform() === 'linux';
};

export class Shell {
  private command: string;
  private shell: string;
  private rl: readline.Interface;

  constructor(command: string) {
    this.command = command.replace(/\\(?! )/g, '/');
    this.shell = getUserShell();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public async asyncExec() {
    return new Promise((res, rej) => {
      const shellProcess = spawn(this.shell, [
        '-c',
        `FORCE_COLOR=true ${this.command}`
      ]);
      this.rl.on('line', (input: any) => {
        shellProcess.stdin.write(input + '\n');
      });

      shellProcess.stdout.on('data', (data) => {
        DokoJSLogger.info(data.toString());
      });
      shellProcess.stdout.on('error', (err: any) => {
        DokoJSLogger.error(err);
      });

      shellProcess.stderr.on('data', (data) => {
        if (!data.toString().includes(ERROR_CODES.SNARK_VM_ERROR)) {
          rej(data.toString());
        } else {
          DokoJSLogger.warn(data.toString());
        }
      });

      shellProcess.on('close', (code) => {
        res(code);
        this.rl.close();
      });
    });
  }
}
