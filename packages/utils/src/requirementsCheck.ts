import { spawn } from 'child_process';
import readline from 'readline';

import { getUserShell, isWindows } from './shell';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const userShell = getUserShell();

console.log('Using shell:', userShell);

const checkProgramInstallation = (command: string) => {
  return new Promise((resolve, reject) => {
    let isInstalled = false;
    const shellProcess = spawn(userShell, ['-c', command]);
    shellProcess.stdout.on('data', (data) => {
      isInstalled = true;
    });

    shellProcess.stderr.on('data', (data) => {
      isInstalled = false;
    });

    shellProcess.on('close', (code) => {
      const program = command.split(' ')[0];
      console.log(
        'Code',
        code,
        ':',
        isInstalled
          ? `${program} is already setup`
          : `${program} needs to be setup`
      );
      resolve(isInstalled);
    });
  });
};

const installProgram = (command: string, shouldEnd: boolean = true) => {
  return new Promise((res, rej) => {
    const shellProcess = spawn(userShell, ['-c', command]);
    rl.on('line', (input) => {
      shellProcess.stdin.write(input + '\n');
    });

    shellProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    shellProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    shellProcess.on('close', (code) => {
      console.log(`Process exited with code for command ${command}`, code);
      if (shouldEnd) rl.close();
      res(0);
    });
  });
};

const checkAndInstallRequirements = async () => {
  const isRustInstalled = await checkProgramInstallation('rustc --version');
  // const isAleoInstalled = await checkProgramInstallation('aleo-develop --help');
  const isSnarkOsInstalled = await checkProgramInstallation('snarkos --help');
  const isLeoInstalled = await checkProgramInstallation('leo --help');

  const needSetup: string[] = [];

  if (!isRustInstalled) needSetup.push('rustc');
  // if (!isAleoInstalled) needSetup.push('aleo-development-server');
  if (!isSnarkOsInstalled) needSetup.push('snarkos');
  if (!isLeoInstalled) needSetup.push('leo-lang');

  const flag = 0;

  if (needSetup.length > 0) {
    const qq = needSetup.map((v, index) => index + 1 + '.' + v + '\n').join('');
    //if (isWindows()) {
    console.log('Please install following for initialization \n' + qq);
    process.exit(0);
    //}
    /*
        const questionString =
      'Need following programs to init. Do you want to continue with installation? \n\n' +
      qq +
      '\n (yes[Y]/no[N]): ';

    const shouldCloseRl = () => {
      return flag === needSetup.length;
    };
  
    rl.question(questionString, async (_answer) => {
      const answer = _answer.toLowerCase();
  
      if (answer === 'yes' || answer === 'y') {
        if (!isRustInstalled) {
          ++flag;
          await installProgram(
            "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
            shouldCloseRl()
          );
        }
  
        if (!isSnarkOsInstalled) {
          ++flag;
          await installProgram('cargo install snarkos', shouldCloseRl());
        }
  
        if (!isAleoInstalled) {
          ++flag;
          await installProgram(
            'cargo install aleo-development-server',
            shouldCloseRl()
          );
        }
  
        if (!isLeoInstalled) {
          ++flag;
          await installProgram('cargo install leo-lang', shouldCloseRl());
        }
      } else {
        console.log('Installation skipped.');
      }
      rl.close();
    });
    */
  }
};

export { checkAndInstallRequirements, checkProgramInstallation };
