
### Release Note: @dokojs/cli 1.2.0, @dokojs/core 1.2.0

#### Key Updates

##### **1. Leo v4.0.0 Compatibility**

- **Updated Leo Version Support:**
  - Commit [`212296c`](https://github.com/venture23-aleo/doko-js/commit/212296c) - Fixed compatibility with Leo v4.0.0
  - Updated compile command flags to align with Leo v4.0.0 CLI interface changes
  - Full compatibility with **Leo v4.0.0** for latest features and stability

##### **2. External Struct Parsing Support**

- **External Struct Type Handling:**
  - Commit [`65c342f`](https://github.com/venture23-aleo/doko-js/commit/65c342f) - Fixed JS artifacts generation for external structs
  - Commit [`a5e7a58`](https://github.com/venture23-aleo/doko-js/commit/a5e7a58) - Fixed external struct conversion to Leo type when used as function inputs
  - Commit [`a3ce3dd`](https://github.com/venture23-aleo/doko-js/commit/a3ce3dd) - External struct types are now correctly imported in TypeScript artifacts
  - Commit [`606875a`](https://github.com/venture23-aleo/doko-js/commit/606875a) - Fixed deep custom type mappings also being added to imports
  - TypeScript artifacts now correctly import and reference external struct types from imported programs
  - External structs are properly converted to Leo types when passed as inputs to program functions

##### **3. Skip Proof Flag Support**

- **Skip Proof Generation for Local Development:**
  - Commit [`47ba034`](https://github.com/venture23-aleo/doko-js/commit/47ba034) - Added config option to skip proof generation for deployment and execution
  - New `skipProofGeneration` flag available in `aleo-config.js` — supported only when using **Leo devnode**
  - Skipping proof generation significantly speeds up local development and testing cycles
  - Flag applies to both deploy and execute commands when running against a local devnode

---


### Release Note: @dokojs/cli 1.1.0, @dokojs/core 1.1.0, @dokojs/utils 1.1.0


#### Key Updates

##### **1. Leo v3.4.0 and SnarkOS v4.4.0 Compatibility**

- **Updated Leo and SnarkOS Version Support:**

  - Commit [`5ef858f`](https://github.com/venture23-aleo/doko-js/commit/5ef858f) - Hotfix for Leo v3.0.0 and SnarkOS v4.0.0 compatibility
  - Commit [`32c0d90`](https://github.com/venture23-aleo/doko-js/commit/32c0d90) - Hotfix for SnarkOS v4.0.1 and Leo v3.0.0 compatibility, API response changes
  - Commit [`a173638`](https://github.com/venture23-aleo/doko-js/commit/a173638) - Fixed for Leo v3.3.1 environment file generation
  - Full compatibility with **Leo v3.4.0** and **SnarkOS v4.4.0** for latest features and stability

- **API Response and Transaction Model Updates:**
  - Commit [`0ab3731`](https://github.com/venture23-aleo/doko-js/commit/0ab3731) - Updated TransactionModel to Transaction for provablehq SDK compatibility
  - Commit [`0f241d7`](https://github.com/venture23-aleo/doko-js/commit/0f241d7) - Updated @provablehq/sdk and @provablehq/wasm versions in lockfile
  - Enhanced handling of API responses to match new SnarkOS formats
  - Fixed consensus heights handling in execute and deploy commands

##### **2. Devnet Configuration Support**

- **Custom Devnet Configuration:**
  - Commit [`355e29b`](https://github.com/venture23-aleo/doko-js/commit/355e29b) - Updated network configurations in aleo-config, repeated function cleanup
  - **Custom devnet configuration added** to `aleo-config.js`
  - Enables users to configure and use custom devnet endpoints
  - Supports local development and testing with custom network configurations
  - Enhanced network flexibility for development workflows
  - **New `aleo-config.js` structure** supporting multiple networks (mainnet, testnet, devnet)

##### **3. Multidimensional Array Parsing**

- **Multidimensional Array Implementation:**
  - Commit [`9742e84`](https://github.com/venture23-aleo/doko-js/commit/9742e84) - Feature: parsing multidimensional array
  - Commit [`7b3b5e0`](https://github.com/venture23-aleo/doko-js/commit/7b3b5e0) - Enhanced parsing of multidimensional array structures
  - Full support for nested array types in Aleo programs with proper type conversion
  - Enhanced parser for multidimensional arrays
  - Improved type handling and better error handling and validation

##### **4. Build and Deployment Enhancements**

- **Local Registry and Build Improvements:**

  - Commit [`a1c1311`](https://github.com/venture23-aleo/doko-js/commit/a1c1311) - Build done using local registry
  - Commit [`f7b21cb`](https://github.com/venture23-aleo/doko-js/commit/f7b21cb) - Fixed: all imports are added to registry
  - Commit [`10874bb`](https://github.com/venture23-aleo/doko-js/commit/10874bb) - Ensured destination folder is defined for each import file in registry
  - Commit [`6727fa7`](https://github.com/venture23-aleo/doko-js/commit/6727fa7) - Ensured correct directory is used for leo build command in buildProgram
  - Enhanced local registry support for building programs
  - Modified program.json handling

- **Deployment Command Updates:**

  - Commit [`b08ad08`](https://github.com/venture23-aleo/doko-js/commit/b08ad08) - Fixed: patch --twice flag removed while using leo deploy
  - Commit [`2622142`](https://github.com/venture23-aleo/doko-js/commit/2622142) - Hotfix: checks deployment for all dependencies and modify program.json handling
  - Commit [`aa8a1c0`](https://github.com/venture23-aleo/doko-js/commit/aa8a1c0) - Fixed: update buildProgram to use default network endpoint from aleoConfig
  - Updated build scripts to use proper network endpoints
  - Fixed Leo deploy and execute commands with proper flags

- **Devnet Flag Support:**
  - Commit [`4949fc1`](https://github.com/venture23-aleo/doko-js/commit/4949fc1) - Added support for devnet in build and deploy commands, and cleanup
  - Commit [`e7a5d44`](https://github.com/venture23-aleo/doko-js/commit/e7a5d44) - Updated devnet flag handling in build, execute, and deploy commands
  - Commit [`c84136e`](https://github.com/venture23-aleo/doko-js/commit/c84136e) - Added devnet and consensus version options for local endpoint in execute and deploy

##### **5. Record Decryption and Encryption Updates**

- **Record Parsing Improvements:**
  - Commit [`63adca1`](https://github.com/venture23-aleo/doko-js/commit/63adca1) - Feature: record decryption changed to make compatible with latest updates
  - Commit [`ab92825`](https://github.com/venture23-aleo/doko-js/commit/ab92825) - Fixed: added `_version` field in record parsing
  - Enhanced compatibility with latest SnarkOS record formats
  - Updated execution helper functionality
  - Enhanced output parsing capabilities

##### **6. Import Management and Dependency Resolution**

- **Import Resolution Enhancements:**
  - Commit [`fefc48a`](https://github.com/venture23-aleo/doko-js/commit/fefc48a) - Fixed: update regex in getFileImports to ignore commented imports
  - Commit [`703e44d`](https://github.com/venture23-aleo/doko-js/commit/703e44d) - Hotfix: take import from imports folder first
  - Updated import resolution from imports folder
  - Fixed regex in getFileImports to ignore commented imports
  - Ensured all imports are properly added to registry
  - Fixed destination folder handling for import files

##### **7. Documentation and Website Updates**

- **Documentation Improvements:**

  - Commit [`49e4b05`](https://github.com/venture23-aleo/doko-js/commit/49e4b05), Commit [`8d741e8`](https://github.com/venture23-aleo/doko-js/commit/8d741e8) - Documentation and latest leo compatibility
  - Commit [`8d37a63`](https://github.com/venture23-aleo/doko-js/commit/8d37a63), Commit [`ee4584f`](https://github.com/venture23-aleo/doko-js/commit/ee4584f) - Improved docs and docs website
  - Commit [`5649706`](https://github.com/venture23-aleo/doko-js/commit/5649706) - Created README.md for wasm package
  - Created comprehensive documentation and docs website
  - Added README for WASM package
  - Updated main README with latest information
  - Improved inline documentation throughout codebase
  - Added release notes and migration guide for upgrading from older versions

- **Website Enhancements:**
  - Commit [`49e2397`](https://github.com/venture23-aleo/doko-js/commit/49e2397) - Docs page responsiveness
  - Commit [`cd880f5`](https://github.com/venture23-aleo/doko-js/commit/cd880f5) - Updated typo and URL for docs
  - Updated web package dependencies
  - Enhanced UI/UX for docs and homepage
  - Improved responsiveness
  - Added new features for encryption/decryption

##### **8. Code Quality and Linting**

- **Linting and Build Script Updates:**
  - Commit [`e3179e0`](https://github.com/venture23-aleo/doko-js/commit/e3179e0) - Refactored: update linting scripts and fix package.json configurations
  - Commit [`d64b0cb`](https://github.com/venture23-aleo/doko-js/commit/d64b0cb) - Wrapped eslint params with string
  - Commit [`d4dd499`](https://github.com/venture23-aleo/doko-js/commit/d4dd499) - Updated build script to use lint instead of lint:fix and add getExtension function
  - Refactored linting scripts
  - Updated ESLint configuration
  - Fixed various bugs and edge cases
  - Removed debug print statements
  - Code cleanup and organization

##### **9. Leo Command Execution Improvements**

- **Execute and Deploy Command Fixes:**
  - Commit [`c2cf378`](https://github.com/venture23-aleo/doko-js/commit/c2cf378) - Fixed: leo execute
  - Commit [`c7904f7`](https://github.com/venture23-aleo/doko-js/commit/c7904f7) - Fixed: adjust zkGetMapping delay and update leoDeployCommand for consistency
  - Commit [`98a8e25`](https://github.com/venture23-aleo/doko-js/commit/98a8e25) - Hotfix: debug print statement added in leo cli command
  - Commit [`12a37d4`](https://github.com/venture23-aleo/doko-js/commit/12a37d4) - Fixed: remove consensus heights option from leo execute and deploy commands
  - Updated compile and deploy scripts
  - Enhanced edition handling
  - Improved command-line argument parsing

##### **10. Package Management and CI/CD**

- **Workflow Updates:**

  - Commit [`d68ca05`](https://github.com/venture23-aleo/doko-js/commit/d68ca05) - CI: update action-setup and checkout to v4
  - Commit [`5d64a20`](https://github.com/venture23-aleo/doko-js/commit/5d64a20) - Use yarn for web deploy
  - Updated GitHub Actions workflows (checkout@v4, action-setup@v4)
  - Modernized GitHub Actions workflows for better performance

- **Package Updates:**
  - Commit [`8dac948`](https://github.com/venture23-aleo/doko-js/commit/8dac948), Commit [`d20a9f1`](https://github.com/venture23-aleo/doko-js/commit/d20a9f1) - Package json updates
  - Commit [`92b7bae`](https://github.com/venture23-aleo/doko-js/commit/92b7bae) - Updated release note and package version
  - Commit [`8ad3b92`](https://github.com/venture23-aleo/doko-js/commit/8ad3b92) - Updated package.json exports for wasm
  - Commit [`6315ae2`](https://github.com/venture23-aleo/doko-js/commit/6315ae2) - Updated: force use of web built distribution for dokojs/wasm
  - Updated package.json configurations across multiple packages
  - Updated dependencies including @provablehq/sdk and @provablehq/wasm
  - Fixed WASM loading and package exports

##### **11. Additional Enhancements**

- **WASM Updates:**

  - Updated Cargo dependencies
  - Enhanced build process with build-package.sh
  - Fixed package distribution for web usage

- **Generator Improvements:**

  - Updated generator utilities
  - Enhanced Leo naming conventions
  - Improved string constants management

- **License:**

  - Commit [`cab2e4c`](https://github.com/venture23-aleo/doko-js/commit/cab2e4c) - Added Apache 2.0 License

- **Bug Fixes:**
  - Commit [`3d0d72b`](https://github.com/venture23-aleo/doko-js/commit/3d0d72b), Commit [`285ead7`](https://github.com/venture23-aleo/doko-js/commit/285ead7) - Bug fix in readme
  - Commit [`5fabd49`](https://github.com/venture23-aleo/doko-js/commit/5fabd49) - Removed extra content from readme
  - Various minor bug fixes and improvements across packages

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
