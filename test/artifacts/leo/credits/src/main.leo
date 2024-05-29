// The 'credits' program.
program credits.aleo {

    record credits {
        owner: address,
        microcredits: u64
    }

    mapping account : address => u64;

    transition mint(receiver: address, amount: u64) -> credits {
        return credits {
            owner: receiver,
            microcredits: amount
        };
    }
    
    transition transfer_private(sender: credits, receiver: address, amount: u64) -> (credits, credits) {
        let difference: u64 = sender.microcredits - amount;

        let remaining: credits = credits {
            owner: sender.owner,
            microcredits: difference,
        };

        let transferred: credits = credits {
            owner: receiver,
            microcredits: amount,
        };

        // Output the sender's change record and the receiver's record.
        return (remaining, transferred);
    }

    transition join(first: credits, second: credits) -> credits {

        return credits {
            owner: first.owner,
            microcredits: first.microcredits + second.microcredits
        };

    }

    transition split(sender: credits, amount: u64) -> (credits, credits) {
        let difference: u64 = sender.microcredits - amount;

        let transferred: credits = credits {
            owner: sender.owner,
            microcredits: amount
        };

        let remaining: credits = credits {
            owner: sender.owner,
            microcredits: difference
        };

        return (transferred, remaining);
    }

    transition fee(sender: credits, amount: u64) -> credits {
        let difference: u64 = sender.microcredits - amount;

        let remaining: credits = credits {
            owner: sender.owner,
            microcredits: difference
        };

        return remaining;
    }
}
