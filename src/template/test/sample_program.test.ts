import { main } from '../artifacts/js/sample_program';

test('Add', async () => {
  const result = await main(1, 2);
  expect(result).toBe(3);
});
