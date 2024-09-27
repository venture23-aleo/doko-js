import { ExecutionMode, parseJSONLikeString } from "@doko-js/core";
import { Types_testContract } from "./artifacts/js/types_test";
import { PrivateKey } from "@provablehq/sdk";
import { decryptCounts } from "./artifacts/js/leo2js/types_test";

const testContract = new Types_testContract({ mode: ExecutionMode.LeoRun });
const timeout = 100_00;
const user = new PrivateKey().to_address().to_string();
const [admin] = testContract.getAccounts();

describe("test types serialization/deserialization(run mode)", () => {

  test("boolean types", async () => {
    let input = true;
    const [result, tx] = await testContract.invert_bool(input);
    tx.wait();
    expect(result).toBe(false);
  }, timeout);

  test("primitive types", async () => {
    let a = 1;
    let b = 2;
    const [result, tx] = await testContract.sum(a, b);
    tx.wait();
    expect(result).toBe(a + b);
  }, timeout);

  test("array types", async () => {
    let a = [10, 20, 30, 40];
    const [result, tx] = await testContract.mean_array(a);
    tx.wait();
    let expectedOutput = 25;
    expect(result).toBe(expectedOutput);
  }, timeout);

  test("address types", async () => {
    const [result, result2, tx] = await testContract.print_address(user);
    tx.wait();
    expect(result).toBe(user);
  }, timeout);

  test("multiple return types", async () => {
    let a = 2;
    const [result, tx] = await testContract.multiple_upto_5(a);
    tx.wait();
    let expectedOutput = [2, 4, 6, 8, 10];
    expect(result).toEqual(expectedOutput);
  }, timeout);

  test("signature check", async () => {
    let signs = "sign169ju4e8s66unu25celqycvsv3k9chdyz4n4sy62tx6wxj0u25vqp58hgu9hwyqc63qzxvjwesf2wz0krcvvw9kd9x0rsk4lwqn2acqhp9v0pdkhx6gvkanuuwratqmxa3du7l43c05253hhed9eg6ppzzfnjt06fpzp6msekdjxd36smjltndmxjndvv9x2uecsgngcwsc2qkns4afd";
    let message = BigInt("0x8b0e74ac4b01b46735841d634ad4f0f30da7ebace94c13b69f783d8f9874020b");
    const [result, result2, tx] = await testContract.check_message_signed(message, user, signs);
    tx.wait();
    expect(result2).toBe(false);
  }, timeout);

  test("struct types", async () => {
    let input = {
      english: 90,
      math: 90,
      nepali: 85
    };
    let average = 88;
    const [result, tx] = await testContract.percentage(input);
    tx.wait();
    expect(result).toBe(average);
  }, timeout);

  test("struct return types", async () => {
    let input = {
      english: 90,
      math: 90,
      nepali: 85
    };
    let input1 = {
      attendance: 300,
      mark: input
    }
    let average = 88;
    const [result, tx] = await testContract.report(input1);
    tx.wait();
    let output = {
      percentage: 88,
      pass: true
    };
    expect(result).toEqual(output);
  }, timeout);

  test("record types", async () => {
    let input = BigInt(2);
    const [result, tx] = await testContract.increase_counter(input);
    let expected_owner = "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px.private";
    const sender = JSON.parse(result);
    expect(sender.owner).toBe(expected_owner);
  }, timeout);

})
