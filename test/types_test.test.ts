import { ExecutionMode } from "@doko-js/core";
import { PrivateKey } from "@provablehq/sdk";
import { decryptCounts } from "./artifacts/js/leo2js/types_test";
import { CreditsContract } from "./artifacts/js/credits";
import { Test_leo_functionsContract } from "./artifacts/js/test_leo_functions";
import { decryptcredits } from "./artifacts/js/leo2js/credits";
import { decryptRecordWithArrays } from "./artifacts/js/leo2js/test_leo_functions";

const testContract = new Test_leo_functionsContract({ mode: ExecutionMode.SnarkExecute });
const creditsContract = new CreditsContract({ mode: ExecutionMode.SnarkExecute })
const timeout = 10000_0000;
const user = new PrivateKey().to_address().to_string();
const [admin] = testContract.getAccounts();
const admin_private_key = process.env.ALEO_DEVNET_PRIVATE_KEY1;

describe("test types serialization/deserialization(execute mode)", () => {
    beforeAll(async () => {
        if (!await testContract.isDeployed()) {
            const tx = await testContract.deploy();
            await tx.wait();
        }
    }, timeout);

    test("boolean types", async () => {
        let input = true;
        const tx = await testContract.inverse_bool(input);
        const [result] = await tx.wait();
        expect(result).toBe(false);
    }, timeout);


    test("primitive types", async () => {
        let a = 1;
        let b = 2;
        const tx = await testContract.sum(a, b);
        const [result] = await tx.wait();
        expect(result).toBe(a + b);
    }, timeout);

    test("array types", async () => {
        let a = [10, 20, 30, 40];
        const tx = await testContract.mean_array(a);
        const [result] = await tx.wait();
        let expectedOutput = 25;
        expect(result).toBe(expectedOutput);
    }, timeout);

    test("address types", async () => {
        const tx = await testContract.print_address(user);
        const [result] = await tx.wait();
        expect(result).toBe(user);
    }, timeout);

    test("multiple return types", async () => {
        let a = 2;
        const tx = await testContract.multiple_upto_5(a);
        const [result] = await tx.wait();
        let expectedOutput = [2, 4, 6, 8, 10];
        expect(result).toEqual(expectedOutput);
    }, timeout);

    test("signature check", async () => {
        let signs = "sign169ju4e8s66unu25celqycvsv3k9chdyz4n4sy62tx6wxj0u25vqp58hgu9hwyqc63qzxvjwesf2wz0krcvvw9kd9x0rsk4lwqn2acqhp9v0pdkhx6gvkanuuwratqmxa3du7l43c05253hhed9eg6ppzzfnjt06fpzp6msekdjxd36smjltndmxjndvv9x2uecsgngcwsc2qkns4afd";
        let message = BigInt("0x8b0e74ac4b01b46735841d634ad4f0f30da7ebace94c13b69f783d8f9874020b");
        const tx = await testContract.check_message_signed(message, user, signs);
        const [, result2] = await tx.wait();
        expect(result2).toBe(false);
    }, timeout);

    test("struct types", async () => {
        let input = {
            english: 90,
            math: 90,
            nepali: 85
        };
        let average = 88;
        const tx = await testContract.percentage(input);
        const [result] = await tx.wait();
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
        const tx = await testContract.report(input1);
        const [result] = await tx.wait();
        let output = {
            percentage: 88,
            pass: true
        };
        expect(result).toEqual(output);
    }, timeout);

    test("record types", async () => {
        let input = BigInt(2);
        const tx = await testContract.increase_counter(input);
        const [result] = await tx.wait();
        let expected_owner = "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px";
        if (testContract.config.mode && testContract.config.mode == ExecutionMode.SnarkExecute) {
            if (!admin_private_key) {
                throw new Error('ALEO_DEVNET_PRIVATE_KEY1 is not defined');
            }
            const senderRecord = decryptCounts(
                result,
                admin_private_key
            );
            expect(senderRecord.owner).toBe(expected_owner);
        } else {
            const record = result as any;
            expect(record.owner).toBe(expected_owner);
        }
    }, timeout);

    test("external record types", async () => {
        const credits = await creditsContract.transfer_public_to_private(admin, BigInt(100));
        const [stringRecord] = await credits.wait();
        if (!admin_private_key) {
            throw new Error('ALEO_DEVNET_PRIVATE_KEY1 is not defined');
        }
        const record = decryptcredits(stringRecord, admin_private_key);
        let amount = BigInt(50);
        const tx1 = await testContract.fund_us(record, amount);
        await tx1.wait();
    }, timeout);

    test("get mapping", async () => {
        const tx = await creditsContract.transfer_public(admin, BigInt(1000000000000));
        await tx.wait();
        const tx1 = await testContract.get_balance(admin);
        await tx1.wait();
        expect(await testContract.fetched_balance(admin)).toBeGreaterThan(await creditsContract.account(admin));
    }, timeout);
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
        const tx = await testContract.generateRecordWithArrays(
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
    }, timeout)
});
