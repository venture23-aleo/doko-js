# @doko-js/core

## 1.0.0

### Major Changes

- 14b6c22: - Remove snarkos dependency from doko-js
  - Replace @aleohq/sdk with @provablehq/sdk
  - Remove dry run feature. Instead of parsing transaction from the output of dry, now
    outputs are fetched from the endpoint and provided to user
  - Add feature to get transaction object from TransactionResponse
  - Deprecate LeoExecute

### Patch Changes

- Updated dependencies [14b6c22]
- Updated dependencies [14b6c22]
  - @doko-js/utils@1.0.0
  - @doko-js/wasm@0.1.1

## 0.3.0

### Minor Changes

- 607c291: - Logger and error handling with custom codes
  - Leo version check added when compiling and building
  - External Aleo code import, compiliation and type gen
  - Fix an issue where parsing failed due to improper handling of new line escape sequence
  - Update aleo registry to project level

### Patch Changes

- Updated dependencies [607c291]
  - @doko-js/utils@0.1.0

## 0.2.0

### Minor Changes

- ac5465e: - Refactored execution modes into seperate classes.
  - Enhanced return types for transaction receipt
  - Added method to retrieve block height of the confirmed transaction from the receipt
  - Added support to handle network type from aleo config

## 0.1.0

### Minor Changes

- 9349c6d: add: support for external records

## 0.0.2

### Patch Changes

- 1f5b491: Update @doko-js/utils version
- Updated dependencies [1f5b491]
  - @doko-js/utils@0.0.2

## 0.0.1

- Initial release
