// The 'sample_program' program.
program sample_program.aleo {
    record token {
        // The token owner.
        owner: address,
        // The token amount.
        amount: u64,
    }

    struct MyField {
        a : u32,
        b : u32,
        c : u32    
    }

    struct MyField2 {
        a : MyField;
        b : u32;
    }

    transition sum(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }

    transition sumObject(public in0: MyField) -> u32 {
        return in0.a + in0.b + in0.c;         
    }
    
    transition sumNestedObject(public in0: MyField2) -> u32 {
        return in0.a.a + in0.a.b + in0.a.c + in0.b;
    }

    transition sumMultipleArg(public in0: MyField, public in1: MyField2) -> u32 {
        return in1.a.a + in1.a.b + in1.a.c + in1.b + in0.a + in0.b + in0.c;
    }

    transition sumMultipleArg2(public in0: MyField, public b : u32) -> u32 {
        return in0.a + in0.b + in0.c + b;
    }

    transition sumArray(public in0: [u32; 4]) -> u32 {
        return in0[0u8] + in0[1u8] + in0[2u8] + in0[3u8]; 
    }

    transition isTrue(public in0: bool) -> bool {
        return in0 == true;
    }

    transition arrayReturn() -> [u32 ; 2]
    {
        return [1u32, 2u32];
    }

    transition objReturn(public in0: MyField) -> MyField
    {
        return in0;
    }

    transition multipleReturn(public a: u32, b: u32) -> (u32, u32) {
        return (a, b);
    }

    transition mint_private(receiver: address, amount: u64) -> token {
        return token {
            owner: receiver,
            amount: amount,
        };
    }

    transition transfer_private(receiver: address, amount: u64) -> (token, token) {
        return (token {
            owner: receiver,
            amount: amount,
        }, token {
            owner: receiver,
            amount: amount * 2u64,
        });
    }

    transition recordTest(input: u32) {
    }

    transition noArgs() -> u32 {
        return 1u32;
    }
}
