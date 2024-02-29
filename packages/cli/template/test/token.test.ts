import { parseRecordString } from '@doko-js/core';
import { PrivateKey } from '@aleohq/sdk';

import { TokenContract } from '../artifacts/js/token';
import { token, tokenLeo } from '../artifacts/js/types/token';
import { gettoken } from '../artifacts/js/leo2js/token';

const TIMEOUT = 200_000;
const amount = BigInt(2);

// Available modes are evaluate | execute (Check README.md for further description)
const mode = 'evaluate';
// Contract class initialization
const contract = new TokenContract({ mode });

// This maps the accounts defined inside networks in aleo-config.js and return array of address of respective private keys
const [admin, user] = contract.getAccounts();

// This method returns private key of associated aleo address
const adminPrivateKey = contract.getPrivateKey(admin);

// Custom function to parse token record data
function parseRecordtoToken(
  recordString: string,
  mode?: 'execute' | 'evaluate',
  privateKey?: string
): token {
  // Records are encrypted in execute mode so we need to decrypt them
  if (mode && mode === 'execute') {
    if (!privateKey)
      throw new Error('Private key is required for execute mode');
    const record = gettoken(
      parseRecordString(
        PrivateKey.from_string(privateKey).to_view_key().decrypt(recordString)
      ) as tokenLeo
    );
    return record;
  }
  const record = gettoken(
    parseRecordString(JSON.stringify(recordString)) as tokenLeo
  );
  return record;
}

// This gets executed before the tests start
beforeAll(async () => {
  // We need to deploy contract before running tests in execute mode
  if (contract.config.mode === 'execute') {
    // This checks for program code on chain to validate that the program is deployed
    const deployed = await contract.isDeployed();

    // If the contract is already deployed we skip deployment
    if (deployed) return;

    const tx = await contract.deploy();
    await contract.wait(tx);
  }
}, TIMEOUT);

test(
  'mint private',
  async () => {
    const [result, tx] = await contract.mint_private(admin, amount);

    // tx is undefined in evaluate mode
    // This method waits for the transction to be broadcasted in execute mode
    if (tx) await contract.wait(tx);

    const senderRecord: token = parseRecordtoToken(
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
    const [token, tx] = await contract.mint_private(admin, amount);
    if (tx) await contract.wait(tx);
    const record: token = parseRecordtoToken(token, mode, adminPrivateKey);

    // Transfer private returns two records so result1 and result2 hold those records and tx1 holds the transaction execution data
    const [result1, result2, tx1] = await contract.transfer_private(
      record,
      user,
      amount
    );

    if (tx1) await contract.wait(tx1);

    const privateKey = contract.getPrivateKey(user);
    const record1 = parseRecordtoToken(result1, mode, adminPrivateKey);
    const record2 = parseRecordtoToken(result2, mode, privateKey);

    expect(record1.amount).toBe(BigInt(0));
    expect(record2.amount).toBe(amount);
  },
  TIMEOUT
);
