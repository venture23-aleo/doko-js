# DokoJS Developer Guide

## Introduction

DokoJS is a powerful and lightweight library designed for seamless interaction with the Aleo blockchain and its diverse ecosystem. Drawing inspiration from the [zk-gaming-toolkit](https://github.com/kryha/zk-gaming-toolkit), Dokojs fully harnesses existing tools while offering a user-friendly interface for developers keen on building atop the Aleo blockchain.

## Installation

Before beginning, make sure you have the following set up:

**1. Rust**: [Installation Guide](https://www.rust-lang.org/tools/install)

**2. Leo language**:
[Installation Guide](https://github.com/ProvableHQ/leo)

### From NPM

Install dokojs globally using npm:
`npm install -g @doko-js/cli@latest`

### From Source

> In case pnpm is not set up, follow the [pnpm installation guide](https://pnpm.io/installation)

```bash
# Download the source file
git clone https://github.com/venture23-aleo/doko-js

cd doko-js

# Install the dependencies
pnpm install

# Build the project
npm run build

# Install dokojs
npm run install:cli
```

## Usage

To use DokoJS, in your terminal, run:

```bash
dokojs
```

The expected output is as following:

```bash
  ____        _             _ ____
 |  _ \  ___ | | _____     | / ___|
 | | | |/ _ \| |/ / _ \ _  | \___ \
 | |_| | (_) |   | (_) | |_| |___) |
 |____/ \___/|_|\_\___/ \___/|____/
Usage: dokojs [options] [command]

DokoJS CLI

Options:
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  init [options] <project-name>    Initialize your DokoJS project
  add <program-name>               Add a new component or resource
  compile                          Compile your DokoJS project
  unflatten                        Create leo build for programs
  autogen                          Generate ts types for contracts - use only after the build has been generated
  run [options] <file>             Run file
  deploy [options] <program-name>  Deploy program
  execute <file-path>              Execute script
  help [command]                   display help for command
```

### Initialize a New Project

Initialize a new project by giving the name of the project.

```
dokojs init <PROJECT_NAME>
```

Let's create a new project called `token`.

> This will internally install the dependencies for the project.

After project initialization, DokoJS generates the following directory structure:

```
├── contract
│   └── base-contract.ts
├── node_modules/
├── programs
│   ├── sample_program.leo
│   └── token.leo
├── scripts
│   └── deploy.ts
├── test
│   ├── sample_program.test.ts
│   └── token.test.ts
├── .env
├── .gitignore
├── aleo-config.js
├── babel.config.json
├── jest.config.json
├── package-lock.json
├── package.json
├── README.md
├── node_modules/
└── tsconfig.json
```

After initializing a projects, it will create following directories:

- contract: This directory contains a single file - `base-contract.ts`, a class containing common method and config for aleo programs in js.
- programs: This directory is made to hold all the leo programs. [`token.leo`](https://github.com/AleoHQ/workshop/blob/master/token/src/main.leo) file is created during the initialization along with `sample_program.leo`
- scripts: This directory is made to hold specific tasks and user scripts.
- test: This directory is made to hold all the tests.
- `aleo-config.js` -> This is a configuration file consisting of private key, method to execute on chain or dry run and different networks.

Let's explore `aleo-config.js`.

```js
import dotenv from 'dotenv';
dotenv.config();

export default {
  accounts: [process.env.ALEO_PRIVATE_KEY],
  mode: 'execute',
  mainnet: {},
  networks: {
    testnet: {
      endpoint: 'http://localhost:3030',
      accounts: [process.env.ALEO_PRIVATE_KEY_TESTNET3,
                 process.env.ALEO_DEVNET_PRIVATE_KEY2]
      priorityFee: 0.01
    },
    mainnet: {
      endpoint: 'https://api.explorer.aleo.org/v1',
      accounts: [process.env.ALEO_PRIVATE_KEY_MAINNET],
      priorityFee: 0.001
    }
  },
  defaultNetwork: 'testnet'
};
```

We have two modes of execution supported:

1. `execute`: In this mode, proof is generated and broadcasted on chain. Internally, it calls `leo developer execute` command.
2. `evaluate`: In this mode, no proof is generated and broadcasted on chain. Internally, it calls `leo run` command.

> `aleo-config` acts as a default configuation for the entire project. It can be overwritten on per program basis as well.

### Adding / Modifying a Program

To add a new program create a new file inside the `programs/` directory.
To modify the existing file, simply modify the existing file or run command

```
dokojs add [PROGRAM_NAME]
```

### Compliation

To compile the project, run:

```
dokojs compile
```

This will create the `artifacts` folder. The artifacts folder has the two main directories:

- leo - This directory contains the Leo packages. For each program in `programs` directory, a corresponding Leo package is created. The leo code from `programs` is copied to the `src/main.leo` file and is then compiled. If the compilation for all the programs are successful, the generated `.aleo` files are parsed to generate Leo and JS types which are inside the js directory.
- js - This directory contains the both Leo types, JS types, `js2leo` (Leo type to Js type conversion), `leo2js` (JS type to Leo type conversion). For each of the program, it also creates <PROGRAM-NAME>.ts file that contains all the transitions and mappings of the program.

```
├── js
│   ├── js2leo
│   │   ├── index.ts
│   │   └── token.ts
│   ├── leo2js
│   │   ├── index.ts
│   │   └── token.ts
│   └── types
│       ├── index.ts
│       └── token.ts
│   ├── sample_program.ts
│   ├── token.ts
└── leo
    ├── sample_program
    │   ├── README.md
    │   ├── build
    │   ├── inputs
    │   ├── leo.lock
    │   ├── outputs
    │   ├── program.json
    │   └── src
    └── token
        ├── README.md
        ├── build
        ├── inputs
        ├── leo.lock
        ├── outputs
        ├── program.json
        └── src
```

> Since, `sample_program` did not have any types, there is no need for js2leo, leo2js or type file.

### Running Tests

After the successful compilation, tests can be written based on the files generated after compilation.

A sample test file is created for both the `sample_program` and `token` program. Run all the tests with:

```
npm run test
```

If you want to test a particular test file:

```
npm run test -- sample_program.test.ts
```

> Pro Tip: You don't need to enter the full test file name. You can use part of the name of the file and the tests that matches the entered name will run.
> Example: `npm run test -- sample`

## Conclusion

This documentation provides a comprehensive guide to installing Dokojs, starting a project, adding programs, compiling, running tests, and deploying programs. Happy coding with Dokojs!

---

## Advanced Testing (WIP)

Create a test file (e.g., token.test.ts) inside the test directory. An example test file is provided below:

```js
import { ExecutionMode } from '@doko-js/core';
import { TokenContract } from '../artifacts/js/token';
import { decrypttoken } from '../artifacts/js/leo2js/token';
import { PrivateKey } from '@provablehq/sdk';

const TIMEOUT = 200_000;

// Available modes are evaluate | execute (Check README.md for further description)
const mode = ExecutionMode.SnarkExecute;
// Contract class initialization
const contract = new TokenContract({ mode });

// This maps the accounts defined inside networks in aleo-config.js and return array of address of respective private keys
const [admin] = contract.getAccounts();
const recipient = process.env.ALEO_DEVNET_PRIVATE_KEY3;

describe('deploy test', () => {
  test('deploy', async () => {
    if ((mode as ExecutionMode) == ExecutionMode.SnarkExecute) {
      const tx = await contract.deploy();
      await tx.wait();
    }
  }, 10000000);

  test('mint public', async () => {
    const actualAmount = BigInt(100000);
    const tx = await contract.mint_public(admin, actualAmount);
    await tx.wait();

    const expected = await contract.account(admin);
    expect(expected).toBe(actualAmount);
  }, 10000000);

  test('mint private', async () => {
    const actualAmount = BigInt(100000);
    const tx = await contract.mint_private(
      'aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px',
      actualAmount
    );
    const [record1] = await tx.wait();

    // @NOTE Only decrypt in SnarkExecute use JSON.parse in LeoRun
    const decryptedRecord = decrypttoken(
      record1,
      process.env.ALEO_PRIVATE_KEY_TESTNET3
    );

    expect(decryptedRecord.amount).toBe(actualAmount);
  }, 10000000);

  test(
    'private transfer to user',
    async () => {
      const account = contract.config.privateKey;
      const amount1 = BigInt(1000000000);
      const amount2 = BigInt(100000000);

      const mintTx = await contract.mint_private(admin, amount1);
      const [result] = await mintTx.wait();
      const decryptedRecord = decrypttoken(result, account);

      const receiptAddress = PrivateKey.from_string(recipient)
        .to_address()
        .to_string();

      const tx = await contract.transfer_private(
        decryptedRecord,
        receiptAddress,
        amount2
      );
      const [record1, record2] = await tx.wait();
      const decryptedRecord2 = decrypttoken(record1, account);

      expect(decryptedRecord2.amount).toBe(amount1 - amount2);
    },
    TIMEOUT
  );
});

```

**Execute the test file:**

>     npm test -- --runInBand token.test.ts


## Dokojs Configuration
The configuration of the dokojs can be defined in `aleo-config.js`

### Description
**accounts:** accepts array of private key.
  >     {accounts: ["aleopk1", process.env.pk2]}

**network:** specifies configuration for different environment. This accept (key, network configuration).
  Network configuration option are: 
  + endpoint: accepts url of the network. For example: http://localhost:3030
  + accounts: accepts array of private key.
  + priorityFee: is a value added to the base fee of a transaction to encourage node operators to process it
  ```
      networks: {
      testnet: {
        endpoint: 'http://localhost:3030',
        accounts: [
          process.env.ALEO_PRIVATE_KEY_TESTNET3,
          process.env.ALEO_DEVNET_PRIVATE_KEY2
        ],
        priorityFee: 0.01
      },
      mainnet: {
        endpoint: 'https://api.explorer.aleo.org/v1',
        accounts: [process.env.ALEO_PRIVATE_KEY_MAINNET],
        priorityFee: 0.001
      }
    }
  ```
**defaultNetwork:** sets the default network while run the test in local environment
```
defaultNetwork: 'testnet'
```


## Base Contract 
This is the base class for type generated program files. This includes common methods used for most of the contract and testing. `base-contract.ts`. It includes methods for deployment, account management, and program execution.

### Constructor ###

**BaseContract(config: Partial<ContractConfig>)**

>     Initializes the contract with the given configuration.

+ Parameters:
  - config (Partial): Partial configuration object for the contract, typically loaded from `aleo-config.js`.
+ Throws: Error if network configuration is missing for the specified network.

### Methods ###

**isDeployed()**
>     Returns a Promise that resolves to a boolean indicating whether the program is deployed.

+ Returns: Promise<boolean>

+ Description: Checks the deployment status of the program on the specified network.
```
Example: 
      let flag = await contract_name.isDeployed()
```

**deploy()**
> Deploys the program to the network.

+ Returns: Promise<any>

+ Description: Deploys the program to the configured network using the snarkDeploy method.

**address()**

>     Retrieves the program’s address.

+ Returns: string

+ Description: Returns the address of the program in the Aleo blockchain.
```
Example: 
      const tx = await contract.deploy();
```



**wait(transaction: T)**

>     Deprecated: Use transaction receipt to wait.

+ Parameters:
  + transaction (TransactionResponse): The transaction object to wait for.
+ Returns: Promise<T>
+ Description: Waits for a transaction to complete and resolves with the transaction response.
```
Example: 
      const tx = await contract.deploy();
      await tx.wait();
```

**getAccounts()**

>     Retrieves all accounts associated with the program's network.

+ Returns: string[]

+ Description: Returns an array of account addresses derived from the network’s private keys.
```
Example: 
      const [admin, user1] = contract.getAccounts();

```

**getDefaultAccount()**

>     Retrieves the default account address.

+ Returns: string

+ Description: Returns the address of the default account based on the private key in the configuration.

```
Example: 
      const user1 = contract.getDefaultAccount();

```


**getPrivateKey(address: string)**

>     Retrieves the private key for a given account address.

+ Parameters:

  +   address (string): The address of the account.

+ Returns: string | undefined

+ Description: Searches for the private key corresponding to the provided account address.

```
Example: 
      const adminPrivateKey = contract.getPrivateKey(admin);

```

**connect(account: string)**

>     Connects to a specified account by its address.

+ Parameters:

  +   account (string): The address of the account to connect to.

+ Throws: Error if the account is not found in the configuration.

+ Description: Updates the configuration to use the private key associated with the provided account address.

```
Example: 
    contract.connect(admin);

```


## DOKOJS CLI 
The DokoJS CLI provides an interface for managing, building, and deploying projects built with DokoJS. Below is a detailed breakdown of its usage and commands, along with examples.

**Usage**

dokojs [options] [command]

**Options**

+ -V, --version: Output the version number of DokoJS.

+ -h, --help: Display help for commands or the CLI in general.

## Commands 

**init [options] <project-name>**

+ Initializes a new DokoJS project.

+ Options:
  > ```--template <template-name>```: Specify a template to use for the project.


Example:

```
dokojs init my-project --template basic
```

This initializes a new DokoJS project named my-project using the basic template.

**add <program-name>**
>     Adds a new component or resource to your project.

Example: ```dokojs add my-program```

This adds a new component or resource named my-program to the project.

**compile [options]**
>     Compiles your DokoJS project.

+ Options:
  > ```--output <directory>```: Specify the output directory for the compiled files.

Example: ```dokojs compile --output ./dist```

This compiles the project and stores the compiled files in the ./dist directory.

**unflatten**
>     Creates a Leo build for programs.

Example: ```dokojs unflatten```

This generates the necessary build files for Leo programs.

**autogen**
>     Generates TypeScript types for contracts. Use this command only after the build has been generated.

Example: ```dokojs autogen```

This generates TypeScript types for the contracts in the project.

**run [options] <file>**
>     Runs a specified file.

Example: ```dokojs run scripts/example.js```

This runs the file scripts/example.js in debug mode.

**deploy [options] <program-name>**
>     Deploys a program to the network.

+ Options:
  >```--network <network>```: Specify the network to deploy to (e.g., mainnet, testnet).

Example: ```dokojs deploy my-program --network testnet```

This deploys the program my-program to the testnet network.

**execute <file-path>**
>     Executes a script located at the given file path.

Example: ```dokojs execute scripts/deploy.js```

This executes the script located at scripts/deploy.js.

**help [command]**
>     Displays help information for a specific command.

Example: ```dokojs help deploy```

This displays help information for the deploy command.

