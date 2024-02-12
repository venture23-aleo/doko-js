import { Sample_programContract } from "../artifacts/js/sample_program";
const contract = new Sample_programContract({ mode: "leo_execute" });

const input0 = {
  a: 5,
  b: 5,
  c: 10
};
const input1 = {
  a: {
    a: 5,
    b: 5,
    c: 10
  },
  b: 20
};

test('deploy', async () => {
  if (contract.config.mode && contract.config.mode == 'execute') {
    const tx = await contract.deploy();
    await contract.wait(tx);
  }
}, 100_000);

test('Primitive Input Type', async () => {
  const [res, tx] = await contract.sum(1, 2);
  if (tx) console.log(tx.id);
  expect(res).toBe(3);
}, 50_000);

test('Object Input Type', async () => {
  const [res, tx] = await contract.sumObject(input0);
  if (tx) console.log(tx.id);
  expect(res).toBe(20);
}, 50_000);

test('Nested Object Input Type', async () => {
  const [res, tx] = await contract.sumNestedObject(input1);
  if (tx) console.log(tx.id);
  expect(res).toBe(40);
}, 50_000);

test('Multiple Object Input Type[1]', async () => {
  const [res, tx] = await contract.sumMultipleArg(input0, input1);
  if (tx) console.log(tx.id);
  expect(res).toBe(60);
}, 50_000);

test('Multiple Object Input Type[2]', async () => {
  const [res, tx] = await contract.sumMultipleArg2(input0, 60);
  if (tx) console.log(tx.id);
  expect(res).toBe(80);
}, 50_000);

test('Array Input Type', async () => {
  const [res, tx] = await contract.sumArray([1, 2, 3, 4]);
  if (tx) console.log(tx.id);
  expect(res).toBe(10);
}, 50_000);

test('Boolean Input Type', async () => {
  const [res, tx] = await contract.isTrue(false);
  if (tx) console.log(tx.id);
  expect(res).toBe(false);
}, 50_000);

test('Array return', async () => {
  const [a, tx] = await contract.arrayReturn();
  if (tx) console.log(tx.id);
  expect(a[0]).toBe(1);
  expect(a[1]).toBe(2);
}, 50_000);


test('Multiple return', async () => {
  const [a, b, tx] = await contract.multipleReturn(1, 2);
  if (tx) console.log(tx.id);
  expect(a).toBe(1);
  expect(b).toBe(2);
}, 50_000);

test('Record return type', async () => {
  const [a, tx] = await contract.mint_private('aleo1vjxelufjmlr9fyhfz588sf5wwuz6c6y69xsrlp0u45ugn2w04srs53d2qs', BigInt(10));
  //const token = gettoken(decryptRecord('', ViewKey.from_string('')));
  // outside the aleo file
  //const token : token = decryptToken(a, privateKey);
  if (tx) console.log(tx.id);
  console.log(a);
  // @TODO
}, 50_000);

test('No return type', async () => {
  await contract.recordTest(3);
  //const token = gettoken(decryptRecord('', ViewKey.from_string('')));
  // outside the aleo file
  //const token : token = decryptToken(a, privateKey);
  // @TODO
}, 50_000);


test('No args', async () => {
  const [a, tx] = await contract.noArgs();
  //const token = gettoken(decryptRecord('', ViewKey.from_string('')));
  // outside the aleo file
  //const token : token = decryptToken(a, privateKey);
  // @TODO
}, 50_000);

test('Object Return Type', async () => {
  await contract.objReturn(input0);
  //const token = gettoken(decryptRecord('', ViewKey.from_string('')));
  // outside the aleo file
  //const token : token = decryptToken(a, privateKey);
  // @TODO
}, 50_000);
