
import credits.aleo;

program types_test.aleo {

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

    struct Report {
        percentage: u32
        pass: bool,
    }
    
    record Counts {
        increased_by: u64,
        owner: address
    }

    mapping counter: bool => u64;

    mapping fetched_balance: address => u64;

    transition invert_bool(public a: bool) -> bool {
        if (a ==  true){
            return false;
        }
        else 
        {
            return true;
        }
    }

    transition sum(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }

    transition mean_array(public in0: [u32; 4]) -> u32 {
        let mean : u32 = (in0[0u8] + in0[1u8] + in0[2u8] + in0[3u8])/4u32;
        return mean; 
    }

    transition print_address(public user1: address) -> (address, address){
        let user: address = self.caller;
        return (user1, user);
    }

    transition multiple_upto_5(public number: u32) -> [u32; 5] {
        return [number*1u32, number*2u32, number*3u32, number*4u32, number*5u32];
    }

    transition check_message_signed(public message: field, public signer: address, public signs: signature) -> (signature, bool) {
        return (signs, signature::verify(signs, signer, message));
    }

    transition percentage(public input: Marks) -> u32 {
        let per: u32 = (input.english + input.math + input.nepali ) / 3u32;
        return per;
    }

    transition report(public input: Report_Card) -> Report {
        let per: u32 = (input.mark.english + input.mark.math + input.mark.nepali ) / 3u32;
        let pass : bool = true; 
        if (input.attendance < 300u32){
            pass = false;
        }
        else{
            pass = true;
        }
        let output: Report = Report {
            percentage: per,
            pass: pass
        };
        return output;
    }

    transition increase_counter(public increased_by: u64) -> Counts {
        let increases: Counts = Counts {
            increased_by: increased_by,
            owner: self.caller
        };
        return increases then finalize(increased_by);
    }

    finalize increase_counter(increased_by: u64) {
        let value: u64 = Mapping::get_or_use(counter, true, 0u64);
        Mapping::set(counter, true, value+increased_by);
    }

    inline admin() -> address {
        return admin_test;
    }

    transition fund_us(sender: credits.aleo/credits, amount: u64) {
        credits.aleo/transfer_private(sender, admin(), amount);
    }

    transition get_balance(public user: address) {
        return then finalize(user);
    }

    finalize get_balance(public user: address) {
       let balance: u64 = Mapping::get(credits.aleo/account, user);
        Mapping::set(fetched_balance, user, balance);
    }
}