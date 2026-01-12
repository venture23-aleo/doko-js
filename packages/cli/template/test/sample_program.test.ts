import { ExecutionMode } from '@doko-js/core';
import { Sample_programContract } from '../artifacts/js/sample_program';
import { PrivateKey } from '@provablehq/sdk';

const TIMEOUT = 200_000;

// Available modes are SnarkExecute | LeoRun (Check README.md for further description)
const mode = ExecutionMode.LeoRun;
// Contract class initialization
const contract = new Sample_programContract({ mode });

// This maps the accounts defined inside networks in aleo-config.js and return array of address of respective private keys
const [admin] = contract.getAccounts();
const recipient = process.env.ALEO_DEVNET_PRIVATE_KEY3;

describe('deploy test', () => {
  test('deploy', async () => {
    if ((mode as ExecutionMode) == ExecutionMode.SnarkExecute) {
      const tx = await contract.deploy();
      await tx.wait();
    }
  }, 10000000);

  test('main adds two numbers', async () => {
    const tx = await contract.main(1, 2)
    const [returnValue] = await tx.wait();
    expect(returnValue).toBe(8);
  }, 10000000);
});
