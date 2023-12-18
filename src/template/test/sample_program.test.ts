import { Sample_programContract } from '../artifacts/js/sample_program';

const contract = new Sample_programContract();
test('Add', async () => {
  const result = await contract.main(1, 2);
  expect(result).toBe(3);
});
