### Release Note: @dokojs/cli 1.0.0, @dokojs/core 1.0.0, @dokojs/utils 1.0.0 & @dokojs/wasm 1.0.0

#### Key Updates
##### **1. Developer Documentations**
- **Update documentation to packages and web:**
    - Commit [`5649706`](https://github.com/venture23-aleo/doko-js/commit/5649706), Commit [`ee4584f`](https://github.com/venture23-aleo/doko-js/commit/ee4584f), Commit [`49e4b05`](https://github.com/venture23-aleo/doko-js/commit/49e4b05) - Updated documentations and Readme, added documentation to website, added jsdoc to functionalities

##### **2. Testings**
- **Added tests:**
  - Commit [`188d6c9`](https://github.com/venture23-aleo/doko-js/commit/188d6c9), Commit [`c1d8651`](https://github.com/venture23-aleo/doko-js/commit/c1d8651), Commit [`0008542`](https://github.com/venture23-aleo/doko-js/commit/0008542) - Added tests for validating the program inputs and outputs, program generations mechanism
  - Commit [`f4147fb`](https://github.com/venture23-aleo/doko-js/commit/f4147fb), Commit [`c1d8651`](https://github.com/venture23-aleo/doko-js/commit/c1d8651) - Updated tests to adapt with testnet beta compatibilities
  - Commit [`ee4584f`](https://github.com/venture23-aleo/doko-js/commit/ee4584f) - Updated jsdoc in test programs

##### **3. Additional Improvements**
 - **Signed type updates and minor improvements:**
    - Commit [`36c97b8`](https://github.com/venture23-aleo/doko-js/commit/36c97b8) Add schema for signed leo types, fixes on some of the leo types
    - Commit [`d48f163`](https://github.com/venture23-aleo/doko-js/commit/d48f163) Update account connect functionality, typo in exported variable for wasm

### Release Note: @dokojs/cli 1.0.0, @dokojs/core 1.0.0, @dokojs/utils 1.0.0 & @dokojs/wasm 0.1.0

#### Key Updates
##### **1. SDK Integration and Migration**
- **Replaced SnarkOS Commands with Leo Commands:** 
  - Commit [`319d8ac`](https://github.com/venture23-aleo/doko-js/commit/319d8ac), [`f770f65`](https://github.com/venture23-aleo/doko-js/commit/f770f65), [`44bc8fc`](https://github.com/venture23-aleo/doko-js/commit/44bc8fc) – Migrated from `snarkos` to `leo` commands (`leo execute`, `leo deploy`) to remove dependencies on SnarkOS, making the project leaner and less dependent on external packages.

- **Transition to `provablehq/sdk`:**
  - Commit [`0a29006`](https://github.com/venture23-aleo/doko-js/commit/0a29006) – Replaced `aleohq/sdk` with `provablehq/sdk` for improved consistency and support with the latest tools and functions.

##### **2. Transaction Encryption/Decryption and Hashing Mechanisms**

- **WASM Enhancements and Utilities for Hashing/Encryption:**
  - Commit [`93c1ce9`](https://github.com/venture23-aleo/doko-js/commit/93c1ce9) – Introduced structures for encryption, decryption, and hashing operations within WebAssembly (WASM) for efficient execution.
  - **Local WASM Dependencies**:
    - Commit [`b55b1b4`](https://github.com/venture23-aleo/doko-js/commit/b55b1b4) – Included local WASM dependencies to streamline the build process, reducing compatibility issues with different environments.
  - **Target Updates for NodeJS Compatibility**:
    - Commit [`fbf45ff`](https://github.com/venture23-aleo/doko-js/commit/fbf45ff) – Updated WASM target for Node.js, ensuring DokoJS operates smoothly in both web and server-side contexts.

##### **3. Web Tools & Website Enhancements**

- **Website Addition for Web Tools:**
  - Commit [`4de1951`](https://github.com/venture23-aleo/doko-js/commit/4de1951) – Added the initial website for web-based contract interaction, generation, and transaction management.
  - **Responsive and UX Improvements**: 
    - Commits [`55c0c07`](https://github.com/venture23-aleo/doko-js/commit/55c0c07), [`ab5974e`](https://github.com/venture23-aleo/doko-js/commit/ab5974e) – Addressed responsive design issues and refined the user interface, ensuring a smoother experience for various devices.

- **Transaction Signature and Hashing Enhancements:**
  - Commits [`f5ea56b`](https://github.com/venture23-aleo/doko-js/commit/f5ea56b), [`5ed0c0d`](https://github.com/venture23-aleo/doko-js/commit/5ed0c0d) – Improved handling of transaction responses, including signature verification and added support for encryption and hashing algorithms.

##### **4. Additional Enhancements**

- **Error Fixes and Compatibility Adjustments:**
  - Commits [`55c0c07`](https://github.com/venture23-aleo/doko-js/commit/55c0c07), [`a01c82c`](https://github.com/venture23-aleo/doko-js/commit/a01c82c), [`5ba1783`](https://github.com/venture23-aleo/doko-js/commit/5ba1783) – Fixed minor issues like build errors, pnpm compatibility, and eslint issues, improving overall code quality and project stability.
  - **Refined Type Definitions and Improved Generators**:
    - Commits [`88a5a6c`](https://github.com/venture23-aleo/doko-js/commit/88a5a6c), [`055d19f`](https://github.com/venture23-aleo/doko-js/commit/055d19f) – Enhanced transaction response formatting and refined type definitions for the transition function with clearer API interfaces.

- **Contract Testing and Template Refinements:**
  - Commits [`61151de`](https://github.com/venture23-aleo/doko-js/commit/61151de), [`5ba1783`](https://github.com/venture23-aleo/doko-js/commit/5ba1783) – Updated sample contracts and fixed issues with base contract generation, ensuring that the templates are functional and coverage for various use cases.

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

PS: **This update mostly focuses on improving current implementation focusing on functionalities and changes included on testnet3. We noticed some inconsistencies and breaking changes incompatible with updated version of leo and snarkos, and will be working on adding support for the changes on upcoming release.**
