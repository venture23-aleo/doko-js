import readline from 'readline';
import { spawn } from 'child_process';

import { getUserShell } from './requirementsCheck';

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
    return new Promise((res) => {
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

      shellProcess.on('close', (code) => {
        res(code);
        this.rl.close();
      });
    });
  }
}

export default Shell;
