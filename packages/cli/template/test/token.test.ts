import { parseRecordString } from '@dokojs/core';
import { PrivateKey } from '@aleohq/sdk';

import { TokenContract } from '../artifacts/js/token';
import { token, tokenLeo } from '../artifacts/js/types/token';
import { gettoken } from '../artifacts/js/leo2js/token';

const TIMEOUT = 200_000;
const amount = BigInt(2);
const mode = 'execute';
const contract = new TokenContract({ mode });
const [admin, user] = contract.getAccounts();
const adminPrivateKey = contract.getPrivateKey(admin);

function parseRecordtoToken(recordString: string, mode?: 'execute' | 'evaluate', privateKey?: string): token {
  if (mode && mode === 'execute') {
    if (!privateKey) throw new Error('Private key is required for execute mode')
    const record = gettoken(parseRecordString(PrivateKey.from_string(privateKey).to_view_key().decrypt(recordString)) as tokenLeo)
    return record

  }
  const record = gettoken(parseRecordString(JSON.stringify(recordString)) as tokenLeo)
  return record
}

beforeAll(async () => {
  if (contract.config.mode === 'execute') {
    const deployed = await contract.isDeployed();
    if (deployed) return;

    const tx = await contract.deploy();
    await contract.wait(tx);
  }
}, TIMEOUT)

test('mint private', async () => {
  const [result, tx] = await contract.mint_private(admin, amount);
  if (tx)
    await contract.wait(tx)

  const senderRecord: token = parseRecordtoToken(result, mode, adminPrivateKey);
  expect(senderRecord.owner).toBe(admin);
  expect(senderRecord.amount.toString()).toBe(amount.toString());
}, TIMEOUT);

test('tranfer private', async () => {
  const [token, tx] = await contract.mint_private(admin, amount);
  if (tx)
    await contract.wait(tx)
  const record: token = parseRecordtoToken(token, mode, adminPrivateKey);

  const [result1, result2, tx1] = await contract.transfer_private(record, user, amount);
  if (tx1)
    await contract.wait(tx1)

  const privateKey = contract.getPrivateKey(user);
  const record1 = parseRecordtoToken(result1, mode, adminPrivateKey)
  const record2 = parseRecordtoToken(result2, mode, privateKey)

  expect(record1.amount).toBe(BigInt(0));
  expect(record2.amount).toBe(amount)
}, TIMEOUT);
