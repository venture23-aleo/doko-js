import { main } from '../artifacts/js/sample_program';

describe('Add', () => {
  it('1+2', async () => {
    await main(1, 2);
  });
});
