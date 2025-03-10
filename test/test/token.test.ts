import { ExecutionMode } from '@doko-js/core';
import { TokenContract } from '../artifacts/js/token';
import { decrypttoken } from '../artifacts/js/leo2js/token';
import { PrivateKey } from '@provablehq/sdk';

const TIMEOUT = 200_000;

// Available modes are evaluate | execute (Check README.md for further description)
const mode = ExecutionMode.SnarkExecute;
// Contract class initialization
const contract = new TokenContract({ mode });

// This maps the accounts defined inside networks in aleo-config.js and return array of address of respective private keys
const [admin] = contract.getAccounts();
const recipient = process.env.ALEO_DEVNET_PRIVATE_KEY3;

describe('deploy test', () => {
  test('deploy', async () => {
    if ((mode as ExecutionMode) == ExecutionMode.SnarkExecute) {
      const isDeployed = await contract.isDeployed();
      if (!isDeployed) {
        const tx = await contract.deploy();
        await tx.wait();
      }
    }
  }, 10000000);

  test('mint public', async () => {
    const actualAmount = BigInt(100000);
    const beforeBalance = await contract.account(admin);
    const tx = await contract.mint_public(admin, actualAmount);
    await tx.wait();
    const afterBalance = await contract.account(admin);
    expect(afterBalance - beforeBalance).toBe(actualAmount);
  }, 10000000);

  test('mint private', async () => {
    const actualAmount = BigInt(100000);
    const tx = await contract.mint_private(
      'aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px',
      actualAmount
    );
    const [record1] = await tx.wait();

    // @NOTE Only decrypt in SnarkExecute use JSON.parse in LeoRun
    const decryptedRecord = decrypttoken(
      record1,
      process.env.ALEO_PRIVATE_KEY_TESTNET3 || ''
    );

    expect(decryptedRecord.amount).toBe(actualAmount);
  }, 10000000);

  test(
    'private transfer to user',
    async () => {
      const account = contract.config.privateKey;
      const amount1 = BigInt(1000000000);
      const amount2 = BigInt(100000000);

      const mintTx = await contract.mint_private(admin, amount1);
      const [result] = await mintTx.wait();
      const decryptedRecord = decrypttoken(result, account);

      if (!recipient) {
        throw new Error('ALEO_DEVNET_PRIVATE_KEY3 is not defined');
      }
      const receiptAddress = PrivateKey.from_string(recipient)
        .to_address()
        .to_string();

      const tx = await contract.transfer_private(
        decryptedRecord,
        receiptAddress,
        amount2
      );
      const [record1, record2] = await tx.wait();
      const decryptedRecord2 = decrypttoken(record1, account);

      expect(decryptedRecord2.amount).toBe(amount1 - amount2);
    },
    TIMEOUT
  );
});
