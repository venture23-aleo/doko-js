import { ExecutionMode } from '@doko-js/core';
import { Marks, Outputs, Report_Card } from '../artifacts/js/types/test_leo_functions';
import { CreditsContract } from '../artifacts/js/credits';
import { decryptcredits } from '../artifacts/js/leo2js/credits';
import { Test_leo_functionsContract } from '../artifacts/js/test_leo_functions';
import { Output } from '@doko-js/core/dist/outputs/types/transaction';
import { decryptRecordWithArrays } from '../artifacts/js/leo2js/types_test';

const TIMEOUT = 200_000;

// Available modes are evaluate | execute (Check README.md for further description)
const mode = ExecutionMode.SnarkExecute;
// Contract class initialization
const test_bool = new Test_leo_functionsContract({ mode });

const credits_contract = new CreditsContract({ mode });

const [admin, user1] = test_bool.getAccounts();
const admin_private_key = process.env.ALEO_DEVNET_PRIVATE_KEY1;
const recipient = process.env.ALEO_DEVNET_PRIVATE_KEY3;

describe('deploy test', () => {
  test('deploy', async () => {
    if ((mode as ExecutionMode) == ExecutionMode.SnarkExecute) {
      await test_bool.isDeployed();
      const tx = await test_bool.deploy();
      await tx.wait();
    }
  }, 10000000);

  test('inverse_bool', async () => {
    const tx = await test_bool.inverse_bool(true);
    const [data] = await tx.wait();
    expect(data).toBe(false);
  }, TIMEOUT);

  test('sum', async () => {
    const tx = await test_bool.sum(1, 2);
    const [data] = await tx.wait();
    expect(data).toBe(3);
  }, TIMEOUT);

  test('meanArray', async () => {
    const tx = await test_bool.meanArray([2,4,6,8]);
    const [data] = await tx.wait();
    expect(data).toBe(5);
  }, TIMEOUT);

  test('print_address', async () => {
    const tx = await test_bool.print_address(admin);
    const [data] = await tx.wait();
    expect(data).toBe(admin);
  }, TIMEOUT);

  test('multiple_upto_5', async () => {
        const tx = await test_bool.multiple_upto_5(1);
        const [data] = await tx.wait();
        console.log("multiple_upto_5", data);
        expect(data).toStrictEqual([1, 2, 3, 4, 5]);
   }, TIMEOUT);

   test('check_message_signed', async () => {
    const signature= "sign14pgmnfa3s56rcn8n249n3rzjct20k4g9uz6hgyqnr556n0w98qqsu5k95vl8g0clrc00mg9hkhtq2zx64mzkxe4fdcxhnx8t0vn8sq5r22qjwn4zc0pzv87twjygsz9m7ekljmuw4jpzf68rwuq99r0tp735vs6220q7tp60nr7llkwstcvu49wdhydx5x2s3sftjskzawhqvzs2uuv";
    const tx = await test_bool.check_message_signed(BigInt(12345), admin, signature);
    const [data, bools] = await tx.wait();
    expect(data).toBe("4pgmnfa3s56rcn8n249n3rzjct20k4g9uz6hgyqnr556n0w98qqsu5k95vl8g0clrc00mg9hkhtq2zx64mzkxe4fdcxhnx8t0vn8sq5r22qjwn4zc0pzv87twjygsz9m7ekljmuw4jpzf68rwuq99r0tp735vs6220q7tp60nr7llkwstcvu49wdhydx5x2s3sftjskzawhqvzs2uuv");
    expect(bools).toBeFalsy();
  }, TIMEOUT);

  test('percentage', async () => {
    const marks: Marks = {
      english: 100,
      math: 100,
      nepali: 100
    };
    const tx = await test_bool.percentage(marks);
    const [data] = await tx.wait();
    expect(data).toBe(100);
  }, TIMEOUT);

  
  test('report', async () => {
    const marks: Marks = {
      english: 100,
      math: 100,
      nepali: 100
    };
    const report_card: Report_Card = {
      attendance: 364,
      mark: marks
    };
    const tx = await test_bool.report(report_card);
    const [data] = await tx.wait();
    const expected_data: Outputs = {
      percentage: 100,
      pass: true
    };
    expect(data).toStrictEqual(expected_data);
  }, TIMEOUT);

  test('increase_counter', async () => {
    const tx = await test_bool.increase_counter(BigInt(1));
    const [data] = await tx.wait();
    expect(await test_bool.counter(true)).toBe(BigInt(1));
  }, TIMEOUT);
  
  test('fund_us', async () => {
    const credits = await credits_contract.transfer_public_to_private(admin, BigInt(100));
    const [record1] = await credits.wait();
    if (!admin_private_key) {
      throw new Error('ALEO_DEVNET_PRIVATE_KEY1 is not defined');
    }
    const decryptedCredits = decryptcredits(record1, admin_private_key);

    const tx = await test_bool.fund_us(decryptedCredits, BigInt(50));
    await tx.wait();
    expect(await credits_contract.account(test_bool.address())).toBe(BigInt(50));
  }, TIMEOUT);

  test('get_balance', async () => {
    const tx = await test_bool.get_balance(test_bool.address());
    await tx.wait();
    expect(await test_bool.fetched_balance(test_bool.address())).toBe(BigInt(50));
  }, TIMEOUT);

  test("test records with arrays, input arrays and output arrays", async () => {
    const fields = [1n, 2n];
    const multiFields = [fields, fields, fields];
    const mark = {
        english: 1,
        math: 2,
        nepali: 3
    }
    const marks = [mark, mark];
    const multiMarks = [marks, marks, marks]
    const tx = await test_bool.generateRecordWithArrays(
        fields,
        multiFields,
        marks,
        multiMarks
    );
    const [recordString, outputFields, outputMultiFields, outputMarks, outputMultiMarks] = await tx.wait();
    if (!admin_private_key) {
      throw new Error('ALEO_DEVNET_PRIVATE_KEY1 is not defined');
    }
    const record = decryptRecordWithArrays(recordString, admin_private_key);
    expect(fields[0]).toBe(outputFields[0]);
    expect(record.fields[0]).toBe(outputFields[0]);
    expect(multiFields[0][0]).toBe(outputMultiFields[0][0]);
    expect(record.multi_fields[0][0]).toBe(outputMultiFields[0][0]);
    expect(marks[0].english).toBe(outputMarks[0].english);
    expect(record.marks[0].english).toBe(outputMarks[0].english);
    expect(multiMarks[0][0].english).toBe(outputMultiMarks[0][0].english);
    expect(record.multi_marks[0][0].english).toBe(outputMultiMarks[0][0].english);
}, TIMEOUT)
});