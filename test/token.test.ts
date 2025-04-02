import { ExecutionMode } from '@doko-js/core';

import { TokenContract } from './artifacts/js/token';
import { token, tokenLeo } from './artifacts/js/types/token';
import { decrypttoken, gettoken } from './artifacts/js/leo2js/token';

const TIMEOUT = 200_000;
const amount = BigInt(2);

// Available modes are evaluate | execute (Check README.md for further description)
const mode = 'evaluate';
// Contract class initialization
const contract = new TokenContract({ mode: ExecutionMode.LeoRun });

// This maps the accounts defined inside networks in aleo-config.js and return array of address of respective private keys
const [admin, user] = contract.getAccounts();

// This method returns private key of associated aleo address
const adminPrivateKey = contract.getPrivateKey(admin) as string;

// Custom function to parse token record data
function parseRecordToToken(
  recordString: string,
  mode?: 'execute' | 'evaluate',
  privateKey?: string
): token {
  // Records are encrypted in execute mode so we need to decrypt them
  if (mode && mode === 'execute') {
    if (!privateKey)
      throw new Error('Private key is required for execute mode');
    const record = decrypttoken(
      recordString,
      adminPrivateKey
    );
    return record;
  }
  const record = gettoken(
    (JSON.parse(recordString)) as tokenLeo
  );
  return record;
}

describe("test token", () => {

  // This gets executed before the tests start
  beforeAll(async () => {
    // We need to deploy contract before running tests in execute mode
    if (contract.config.mode === ExecutionMode.SnarkExecute) {
      // This checks for program code on chain to validate that the program is deployed
      const deployed = await contract.isDeployed();

      // If the contract is already deployed we skip deployment
      if (deployed) return;

      const tx = await contract.deploy();
      await tx.wait();
    }
  }, TIMEOUT);

  test(
    'mint private',
    async () => {
      const tx = await contract.mint_private(admin, amount);
      const [result] = await tx.wait();

      const senderRecord: token = parseRecordToToken(
        result,
        mode,
        adminPrivateKey
      );
      expect(senderRecord.owner).toBe(admin);
      expect(senderRecord.amount.toString()).toBe(amount.toString());
    },
    TIMEOUT
  );

  test(
    'transfer private',
    async () => {
      const tx = await contract.mint_private(admin, amount);
      const [token] = await tx.wait();
      const record: token = parseRecordToToken(token, mode, adminPrivateKey);

      // Transfer private returns two records so result1 and result2 hold those records and tx1 holds the transaction execution data
      const tx1 = await contract.transfer_private(
        record,
        user,
        amount
      );
      const [result1, result2] = await tx1.wait();

      const privateKey = contract.getPrivateKey(user);
      const record1 = parseRecordToToken(result1, mode, adminPrivateKey);
      const record2 = parseRecordToToken(result2, mode, privateKey);

      expect(record1.amount).toBe(BigInt(0));
      expect(record2.amount).toBe(amount);
    },
    TIMEOUT
  );
})