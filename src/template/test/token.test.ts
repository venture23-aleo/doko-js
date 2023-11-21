import { mint_private } from '../artifacts/js/token';

const owner = 'aleo1uwuxqnhkg9wsmqvsfjdm3jqsevx4fgme2ml405sgduc66d4cpc8swkn28j';
const amount = BigInt(2);

test('mint private', async () => {
  const result = await mint_private(owner, amount);
  expect(result.owner).toBe(owner);
  expect(result.amount.toString()).toBe(amount.toString());
});
