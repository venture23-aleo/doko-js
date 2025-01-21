# `@doko-js/wasm` - WebAssembly Encryption/Decryption & Hashing Library

This is a WebAssembly-based library for encryption, decryption, and hashing using the Aleo network's cryptographic primitives. The library is built with Rust and compiled to WebAssembly (Wasm) to be used in JavaScript environments. 

## Features

- **Encryption/Decryption:** Encrypt and decrypt plaintext and ciphertext using symmetric encryption schemes.
- **Hashing:** Hash input data using various cryptographic algorithms like `keccak256`, `bhp256`, `ped64`, and more.
- **Program ID to Address Conversion:** Convert Aleo program name to ids.
- **Support for Testnet and Mainnet:** The library supports both Aleo's Testnet and Mainnet networks.

## Installation

Install the library in your project using npm:

```bash
npm install @doko-js/wasm
```

Or using yarn:

```bash
yarn add @doko-js/wasm
```

## Usage

To use the `@doko-js/wasm` library in your JavaScript project, import the WebAssembly functions and use them for encryption, decryption, and hashing.

### Encryption/Decryption

- **`Encrypter.get_encrypted_value(val, program, fn_name, input_index, pk, tpk, network)`**
  - Encrypts a plaintext value using the provided parameters.
  - **Parameters:**
    - `val` - The plaintext to encrypt.
    - `program` - The program name.
    - `fn_name` - The function name.
    - `input_index` - The index of the input in the function.
    - `pk` - The private key.
    - `tpk` - The transaction public key (tpk).
    - `network` - The Aleo network ("testnet" or "mainnet").
  - **Returns:** The encrypted ciphertext as a string.

- **`Decrypter.get_decrypted_value(cipher, program, fn_name, input_index, pk, tpk, network)`**
  - Decrypts a ciphertext using the provided parameters.
  - **Parameters:**
    - `cipher` - The ciphertext to decrypt.
    - `program` - The program name.
    - `fn_name` - The function name.
    - `input_index` - The index of the input in the function.
    - `pk` - The private key.
    - `tpk` - The transaction public key (tpk).
    - `network` - The Aleo network (Testnet or Mainnet).
  - **Returns:** The decrypted plaintext as a string.

### Example: Encryption and Decryption

```javascript
import { Encrypter, Decrypter } from '@doko-js/wasm';

// Encryption Example
const encryptedValue = Encrypter.get_encrypted_value(
  "3u32",
  "types_test.aleo",
  "sum",
  2, // input index
  "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH",
  "4894085870840878070008938887517642593787940398952348563490477594935969679255group",
  "testnet" // or "mainnet"
);
console.log("Encrypted value:", encryptedValue);

// Decryption Example
const decryptedValue = Decrypter.get_decrypted_value(
  "ciphertext1qyqv5fj8jc4enpvl8xdkxllvdhxe49qz3mn72xmr574ve5n4qtuawpgs4egw3",
  "types_test.aleo",
  "sum",
  2, // input index
    "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH",
  "4894085870840878070008938887517642593787940398952348563490477594935969679255group",
  "testnet" // or "mainnet"
);
console.log("Decrypted value:", decryptedValue);
```

### Hashing

- **`Hasher.hash(alg, val, out, network)`**
  - Hashes the provided value using the specified algorithm.
  - **Parameters:**
    - `alg` - The hashing algorithm (e.g., `keccak256`, `bhp256`, etc.).
    - `val` - The value to hash.
    - `out` - The output type (e.g., `address`).
    - `network` - The Aleo network (Testnet or Mainnet).
  - **Returns:** The hashed value as a string.

**Supported Algorithm Type:** ```"bhp256"|"bhp512"|"bhp768"|"bhp1024"|"keccak256"|"keccak384"|"keccak512"| "ped64"|"ped128"|"sha3_256"|"sha3_384"|"sha3_512"```;

**Supported Output Types:** = ```"address"|"boolean"|"field"|"group"|"i8"|"i16"|"i32"|"i64"|"i128"|"u8"|"u16"|"u32"|"u64"|"u128"|"scalar"```;

### Example: Hashing

```javascript

const hashedValue = Hasher.hash(
  "keccak256", // algorithm
  "{arr: [1u8, 1u8], size: 2u8}", // input value
  "address", // output type
  "testnet" // or "mainnet
);
console.log("Hashed value:", hashedValue);
```

## Program to ID conversion
`to_address(program: String, network: AleoNetwork)`
- Converts a program name to aleo id.
- **Parameters:**
    - program - The program ID to convert.
    - network - The Aleo network (Testnet or Mainnet).
- **Returns:** The blockchain address as a string.

```javascript
import init, { to_address } from '@doko-js/wasm';

// Convert Program ID to Address
const programName = "credits.aleo"; // Replace with your program ID
const ID = to_address(programName, "testnet");
console.log("ID:", address);

```

## Building from Source

To build the WebAssembly package from the Rust source code, follow these steps:

1. **Install Rust and wasm-pack:**
   Make sure you have Rust installed. You will also need `wasm-pack` for building the Rust code to WebAssembly.
   
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

2. **Build the package:**

   ```bash
   wasm-pack build --target bundler
   ```

### Acknowledgement
This library is referenced from [Provable Sdk](https://github.com/ProvableHQ/sdk). Please refer to the repo for any advanced implementations.
