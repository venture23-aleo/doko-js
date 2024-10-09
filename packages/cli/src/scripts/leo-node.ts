import { spawn } from 'child_process';
import readline from 'readline';
import { DokoJSLogger, getAleoConfig } from '@doko-js/utils';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const userShell = process.env.SHELL || '/bin/sh';

async function runAleoNode(network: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = await getAleoConfig();
  const nodeConfig = config[network];

  if (!nodeConfig) {
    DokoJSLogger.error(`Config for ${network} not available`);
    process.exit(1);
  }

  const {
    node,
    server: { port, host }
  } = nodeConfig;

  // Launch Aleo Development Server
  const adsProcess = spawn(userShell, [
    '-c',
    `aleo-develop start -p ${node} -a ${host}:${port}`
  ]);

  rl.on('line', (input) => {
    adsProcess.stdin.write(input + '\n');
  });

  adsProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  adsProcess.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  process.on('SIGINT', () => {
    adsProcess.kill('SIGINT');
    process.exit(0);
  });
}

export { runAleoNode };
