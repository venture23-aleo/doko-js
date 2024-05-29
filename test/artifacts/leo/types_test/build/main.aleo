import credits.aleo;
program types_test.aleo;


struct Marks:
    english as u32;
    math as u32;
    nepali as u32;

struct Report_Card:
    attendance as u32;
    mark as Marks;

struct Report:
    percentage as u32;
    pass as boolean;

record Counts:
    owner as address.private;
    increased_by as u64.private;


mapping counter:
	key as boolean.public;
	value as u64.public;


mapping fetched_balance:
	key as address.public;
	value as u64.public;

function invert_bool:
    input r0 as boolean.public;
    is.eq r0 true into r1;
    ternary r1 false true into r2;
    output r2 as boolean.private;


function sum:
    input r0 as u32.public;
    input r1 as u32.private;
    add r0 r1 into r2;
    output r2 as u32.private;


function mean_array:
    input r0 as [u32; 4u32].public;
    add r0[0u32] r0[1u32] into r1;
    add r1 r0[2u32] into r2;
    add r2 r0[3u32] into r3;
    div r3 4u32 into r4;
    output r4 as u32.private;


function print_address:
    input r0 as address.public;
    output r0 as address.private;
    output self.caller as address.private;


function multiple_upto_5:
    input r0 as u32.public;
    mul r0 1u32 into r1;
    mul r0 2u32 into r2;
    mul r0 3u32 into r3;
    mul r0 4u32 into r4;
    mul r0 5u32 into r5;
    cast  r1 r2 r3 r4 r5 into r6 as [u32; 5u32];
    output r6 as [u32; 5u32].private;


function check_message_signed:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as signature.public;
    sign.verify r2 r1 r0 into r3;
    output r2 as signature.private;
    output r3 as boolean.private;


function percentage:
    input r0 as Marks.public;
    add r0.english r0.math into r1;
    add r1 r0.nepali into r2;
    div r2 3u32 into r3;
    output r3 as u32.private;


function report:
    input r0 as Report_Card.public;
    add r0.mark.english r0.mark.math into r1;
    add r1 r0.mark.nepali into r2;
    div r2 3u32 into r3;
    lt r0.attendance 300u32 into r4;
    ternary r4 false true into r5;
    cast r3 r5 into r6 as Report;
    output r6 as Report.private;


function increase_counter:
    input r0 as u64.public;
    cast self.caller r0 into r1 as Counts.record;
    async increase_counter r0 into r2;
    output r1 as Counts.record;
    output r2 as types_test.aleo/increase_counter.future;

finalize increase_counter:
    input r0 as u64.public;
    get.or_use counter[true] 0u64 into r1;
    add r1 r0 into r2;
    set r2 into counter[true];




function fund_us:
    input r0 as credits.aleo/credits.record;
    input r1 as u64.private;
    call credits.aleo/transfer_private r0 aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc r1 into r2 r3;


function get_balance:
    input r0 as address.public;
    async get_balance r0 into r1;
    output r1 as types_test.aleo/get_balance.future;

finalize get_balance:
    input r0 as address.public;
    get credits.aleo/account[r0] into r1;
    set r1 into fetched_balance[r0];
