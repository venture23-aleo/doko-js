import { TokenContract } from '../artifacts/js/token';

const owner = 'aleo1uwuxqnhkg9wsmqvsfjdm3jqsevx4fgme2ml405sgduc66d4cpc8swkn28j';
const amount = BigInt(2);

const contract = new TokenContract();

test('mint private', async () => {
  const result = await contract.mint_private(owner, amount);
  expect(result.owner).toBe(owner);
  expect(result.amount.toString()).toBe(amount.toString());
});

test('tranfer private', async () => {
  const token = await contract.mint_private(owner, amount);
  const result = await contract.transfer_private(token, token.owner, amount);
});
