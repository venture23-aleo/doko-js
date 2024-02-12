# @aleojs/core

## 0.2.0

### Minor Changes

- 6dfa9cd: add ZkExecution interface for returning result of zkRun,zkExecute,snarkExecute
  enhance cmd output(stdout) parser to handle multiple json return types (zkRun, zkExecute)
  return transaction object after executing transitions
  add functionality to decrypt transaction object and return output

### Patch Changes

- 930c6c1: Copy private key from aleo-config.js to leo build
- 4334483: Update sample_program test
  Remove axios as dependency and replace with native fetch

## 0.1.0

### Minor Changes

- Minor updates & code cleanup

### Patch Changes

- Updated dependencies
  - @aleojs/utils@0.1.0
