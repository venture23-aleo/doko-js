// Importing credits program
import credits.aleo;

program test_leo_functions.aleo {

    const admin_test: address = aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc;

    struct Marks {
        english : u32,
        math : u32, 
        nepali : u32
    }

    struct Report_Card {
        attendance: u32,
        mark: Marks
    }

    struct Outputs {
        percentage: u32,
        pass: bool
    }
    
    record Counts {
        increased_by: u64,
        owner: address
    }

    mapping counter: bool => u64;

    mapping fetched_balance: address => u64;

    /**
     * @notice Inverts the input boolean value.
     * @param a The boolean value to invert.
     * @return The inverted boolean value.
     */
    transition inverse_bool(public a: bool) -> bool {
        if (a == true) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @notice Adds two unsigned 32-bit integers.
     * @param a The first number.
     * @param b The second number.
     * @return The sum of the two numbers.
     */
    transition sum(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }

    /**
     * @notice Calculates the mean of an array of four unsigned 32-bit integers.
     * @param in0 The array of numbers.
     * @return The mean value.
     */
    transition meanArray(public in0: [u32; 4]) -> u32 {
        let mean: u32 = (in0[0u8] + in0[1u8] + in0[2u8] + in0[3u8]) / 4u32;
        return mean;
    }

    /**
     * @notice Returns the input address and the caller's address.
     * @param user1 The input address.
     * @return A tuple containing the input address and the caller's address.
     */
    transition print_address(public user1: address) -> (address, address) {
        let user: address = self.caller;
        return (user1, user);
    }

    /**
     * @notice Calculates the first five multiples of a number.
     * @param number The input number.
     * @return An array containing the first five multiples.
     */
    transition multiple_upto_5(public number: u32) -> [u32; 5] {
        return [number * 1u32, number * 2u32, number * 3u32, number * 4u32, number * 5u32];
    }

    /**
     * @notice Verifies if a message is signed by the given signer.
     * @param message The message to verify.
     * @param signer The address of the signer.
     * @param signs The signature.
     * @return A tuple containing the signature and a boolean indicating verification status.
     */
    transition check_message_signed(public message: field, public signer: address, public signs: signature) -> (signature, bool) {
        return (signs, signature::verify(signs, signer, message));
    }

    /**
     * @notice Calculates the percentage of marks in three subjects.
     * @param input The marks in three subjects.
     * @return The calculated percentage.
     */
    transition percentage(public input: Marks) -> u32 {
        let per: u32 = (input.english + input.math + input.nepali) / 3u32;
        return per;
    }

    /**
     * @notice Generates a report card with percentage and pass/fail status.
     * @param input The report card details including marks and attendance.
     * @return The report output containing percentage and pass status.
     */
    transition report(public input: Report_Card) -> Outputs {
        let per: u32 = (input.mark.english + input.mark.math + input.mark.nepali) / 3u32;
        let pass: bool = input.attendance >= 300u32;
        let output: Outputs = Outputs { percentage: per, pass: pass };
        return output;
    }

    /**
     * @notice Increases the counter by a specified amount.
     * @param increased_by The value to increase the counter by.
     * @return A tuple containing the count details and a future object for finalization.
     */
    async transition increase_counter(public increased_by: u64) -> (Counts, Future) {
        let increases: Counts = Counts { increased_by: increased_by, owner: self.caller };
        return (increases, finalize_increase_counter(increased_by));
    }

    /**
     * @notice Finalizes the counter increment operation.
     * @param increased_by The value to add to the counter.
     */
    async function finalize_increase_counter(increased_by: u64) {
        let value: u64 = Mapping::get_or_use(counter, true, 0u64);
        Mapping::set(counter, true, value + increased_by);
    }

    /**
     * @notice Returns the admin address.
     * @return The admin address.
     */
    inline admin() -> address {
        return admin_test;
    }

    /**
     * @notice Facilitates funding by transferring credits and initiates a finalization process.
     * @param sender The source of the credits.
     * @param amount The amount of credits to transfer.
     * @return A tuple containing the remaining credits and a future object for finalization.
     */
    async transition fund_us(sender: credits.aleo/credits, amount: u64) -> (credits.aleo/credits, Future) {
        let (left_credits, credits_future): (credits.aleo/credits, Future) = credits.aleo/transfer_private_to_public(sender, test_leo_functions.aleo, amount);
        return (left_credits, finalize_fund_us(credits_future));
    }

    /**
     * @notice Finalizes the fund transfer process.
     * @param f0 The future object for the fund transfer.
     */
    async function finalize_fund_us(f0: Future) {
        f0.await();
    }

    /**
     * @notice Initiates fetching the balance of a user.
     * @param user The user's address.
     * @return A future object for finalization.
     */
    async transition get_balance(public user: address) -> Future {
        return (finalize_get_balance(user));
    }

    /**
     * @notice Finalizes fetching the balance and updates the mapping.
     * @param user The user's address.
     */
    async function finalize_get_balance(public user: address) {
        let balance: u64 = Mapping::get(credits.aleo/account, user);
        Mapping::set(fetched_balance, user, balance);
    }
}
