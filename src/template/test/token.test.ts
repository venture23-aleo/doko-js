import { mint_private } from '../artifacts/js/token';

const walletAddress =
  'aleo1uwuxqnhkg9wsmqvsfjdm3jqsevx4fgme2ml405sgduc66d4cpc8swkn28j';

test('mint private', async () => {
  expect(await mint_private(walletAddress, BigInt(2)));
});
