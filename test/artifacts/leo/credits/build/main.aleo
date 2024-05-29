program credits.aleo;

record credits:
    owner as address.private;
    microcredits as u64.private;


mapping account:
	key as address.public;
	value as u64.public;

function mint:
    input r0 as address.private;
    input r1 as u64.private;
    cast r0 r1 into r2 as credits.record;
    output r2 as credits.record;


function transfer_private:
    input r0 as credits.record;
    input r1 as address.private;
    input r2 as u64.private;
    sub r0.microcredits r2 into r3;
    cast r0.owner r3 into r4 as credits.record;
    cast r1 r2 into r5 as credits.record;
    output r4 as credits.record;
    output r5 as credits.record;


function join:
    input r0 as credits.record;
    input r1 as credits.record;
    add r0.microcredits r1.microcredits into r2;
    cast r0.owner r2 into r3 as credits.record;
    output r3 as credits.record;


function split:
    input r0 as credits.record;
    input r1 as u64.private;
    sub r0.microcredits r1 into r2;
    cast r0.owner r1 into r3 as credits.record;
    cast r0.owner r2 into r4 as credits.record;
    output r3 as credits.record;
    output r4 as credits.record;


function fee:
    input r0 as credits.record;
    input r1 as u64.private;
    sub r0.microcredits r1 into r2;
    cast r0.owner r2 into r3 as credits.record;
    output r3 as credits.record;
