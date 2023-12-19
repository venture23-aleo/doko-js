import readline from 'readline';
import { spawn } from 'child_process';

import { getUserShell } from './requirementsCheck';

const ERROR_CODES = {
  SNARK_VM_ERROR: 'ECLI0377010'
};

class Shell {
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
        console.log(data.toString());
      });
      shellProcess.stdout.on('error', (err: any) => {
        console.log(err);
      });

      shellProcess.stderr.on('data', (data) => {
        if (!data.toString().includes(ERROR_CODES.SNARK_VM_ERROR)) {
          rej(data.toString());
        } else {
          console.warn(`\x1b[31;1;33m${data.toString()}\x1b[0m`);
        }
      });

      shellProcess.on('close', (code) => {
        res(code);
        this.rl.close();
      });
    });
  }
}

export default Shell;
