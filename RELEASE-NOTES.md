### Release Note: @dokojs/cli 0.2.0, @dokojs/core 0.3.0 & @dokojs/utils 0.1.0

#### Key Updates:

1. **Leo v2 compatibility network flag**
   - Update to leo compile command for Leo V2 cli for compilation process stability. The dokojs will take default network from its manifest and add it as flag to the leo build command

2. **BugFix for import directory/ newline**
   - Fix issue where copying empty import directory throws error
   - Fix issue with newline in windows(\r\n) which was not handled before

3. **Logging and Error handling**
   - Handle errors with custom codes for easier debugging
   - Add escaped color coding for different log levels
   - Pass log level as variable in commands

4. **Aleo code import, compilation, and typegen**
   - Added support to check for imported contract source code on chain if not does exist on project repo (like credits.aleo)
   - Improved registry and caching of contract on project level

5. **Some minor improvements, code cleanups and bug fixes**

#### References:
- https://github.com/venture23-aleo/doko-js/blob/main/packages/cli/CHANGELOG.md
- https://github.com/venture23-aleo/doko-js/blob/main/packages/core/CHANGELOG.md
- https://github.com/venture23-aleo/doko-js/blob/main/packages/utils/CHANGELOG.md

### Release Note: @dokojs/cli 0.1.0 & @dokojs/core 0.2.0

#### Key Updates:

1. **Improved Type Generation**
   - Enhanced return type declarations for different modes, ensuring more accurate and expected types instead of generic `any` types in contract methods. This improvement facilitates easier access to properties and smoother development workflows.

2. **Receipt Enhancements**
   - Introduced a more efficient transaction waiting mechanism. Developers no longer need to pass the transaction instance as a dependency; instead, they can use the `.wait()` method directly from the transaction itself.
   - Added support for including `blockNumber` in the receipt, providing more comprehensive transaction details.

3. **TypeScript Fixes**
   - Addressed inconsistencies with type imports and generation in TypeScript. Previously, some generated types were not properly exported, requiring manual code updates by developers. This issue has now been resolved, streamlining the development process.

4. **Network Configuration Support**
   - Expanded support for handling network types from the Aleo configuration. In addition to the existing support for testnet3, users can now specify the network and RPC endpoint, enabling easy switching between different networks without hassle.

#### References:
- https://github.com/venture23-aleo/doko-js/blob/main/packages/cli/CHANGELOG.md
- https://github.com/venture23-aleo/doko-js/blob/main/packages/core/CHANGELOG.md

PS: **This update mostly focuses on improving current implementation focusing on functionalities and changes included on testnet3. We noticed some inconsistencies and breaking changes incompatible with updataed version of leo and snarkos, and will be working on adding support for the changes on upcoming release.**
