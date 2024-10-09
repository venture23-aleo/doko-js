---
'@doko-js/core': major
---

- Remove snarkos dependency from doko-js
- Replace @aleohq/sdk with @provablehq/sdk
- Remove dry run feature. Instead of parsing transaction from the output of dry, now
  outputs are fetched from the endpoint and provided to user
- Add feature to get transaction object from TransactionResponse
- Deprecate LeoExecute