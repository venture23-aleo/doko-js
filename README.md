# AleoJS Developer Guide


## Introduction
AleoJS is a powerful and lightweight library designed for seamless interaction with the Aleo blockchain and its diverse ecosystem. Drawing inspiration from the [zk-gaming-toolkit](https://github.com/kryha/zk-gaming-toolkit), Aleo.js fully harnesses existing tools while offering a user-friendly interface for developers keen on building atop the Aleo blockchain.


## Installation
Before beginning, make sure you have the following set up:

**1. Rust**: [Installation Guide](https://www.rust-lang.org/tools/install)

**2. SnarkOS**: [Installation Guide](https://github.com/aleoHQ/snarkos)
> In case there are some issues with build try from [here](https://github.com/eqlabs/snarkOS/tree/fix/compile)

**3. Leo language**:
[Installation Guide](https://github.com/aleoHQ/leo)

### From NPM
Install Aleo.js globally using npm:
```npm install -g @aleojs/cli@latest```

### From Source

```bash
# Download the source file
git clone https://github.com/venture23-zkp/aleojs

cd aleojs

# Install the dependencies
pnpm install

# Build the project
npm run build

# Install aleojs
npm run install:cli
```
> In case pnpm is not set up, follow the [pnpm installation guide](https://pnpm.io/installation)

## Usage
To use AleoJS, in your terminal, run:

```bash
aleojs-cli-dev
```

The expected output is as following:
```bash     _    _                _ ____ 
    / \  | | ___  ___     | / ___| 
   / _ \ | |/ _ \/ _ \ _  | \___ \ 
  / ___ \| |  __/ (_) | |_| |___) |
 /_/   \_\_|\___|\___/ \___/|____/ 
Usage: aleojs-cli-dev [options] [command]

AleoJS CLI

Options:
  -h, --help                       display help for command
  -V, --version                    output the version number

Commands:
  init [options] <project-name>    Initialize your AleoJS project
  add <program-name>               Add a new component or resource
  compile                          Compile your AleoJS project
  unflatten                        Create leo build for programs
  autogen                          Generate ts types for contracts - use only after the build has been generated
  start [options] <node>           Run your AleoJS project
  run [options] <file>             Run file
  deploy [options] <program-name>  Deploy program
  execute <file-path>              Execute script
  help [command]                   display help for command
```

### Initialize a New Project

Initialize a new project by giving the name of the project.
```
aleojs-cli-dev init <PROJECT_NAME>
```
Let's create a new project called `token`. 
> This will internally install the dependencies for the project.


After project initialization, AleoJS generates the following directory structure:

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

* contract: This directory contains a single file - `base-contract.ts`, a class containing common method and config for aleo programs in js. 
* programs: This directory is made to hold all the leo programs. [`token.leo`](https://github.com/AleoHQ/workshop/blob/master/token/src/main.leo) file is created during the initialization along with `sample_program.leo`
* scripts: This directory is made to hold specific tasks and user scripts.
* test: This directory is made to hold all the tests.
* `aleo-config.js` -> This is a configuration file consisting of private key, method to execute on chain or dry run and different networks.

Let's explore `aleo-config.js`.
```js
import dotenv from 'dotenv';
dotenv.config();

export default {
  accounts: [process.env.ALEO_PRIVATE_KEY],
  mode: 'execute',
  mainnet: {},
  networks: {
    testnet3: {
      endpoint: 'http://localhost:3030',
      accounts: [process.env.ALEO_PRIVATE_KEY_TESTNET3],
      priorityFee: 0.01
    },
    mainnet: {
      endpoint: 'https://api.explorer.aleo.org/v1',
      accounts: [process.env.ALEO_PRIVATE_KEY_MAINNET],
      priorityFee: 0.001
    }
  },
  defaultNetwork: 'testnet3'
};
```

We have two modes of execution supported:
1. `execute`: In this mode, proof is generated and broadcasted on chain. Internally, it calls `snarkos developer execute` command.
2. `evaluate`: In this mode, no proof is generated and broadcasted on chain. Internally, it calls `leo run` command.

> `aleo-config` acts as a default configuation for the entire project. It can be overwritten on per program basis as well.

### Adding / Modifying a Program
To add a new program create a new file inside the `programs/` directory. 
To modify the existing file, simply modify the existing file.

### Compliation
To compile the project, run:
```
aleojs-cli-dev compile
```
This will create the `artifacts` folder. The artifacts folder has the two main directories:

* leo - This directory contains the Leo packages. For each program in `programs` directory, a corresponding Leo package is created. The leo code from `programs` is copied to the `src/main.leo` file and is then compiled. If the compilation for all the programs are successful, the generated `.aleo` files  are parsed to generate Leo and JS types which are inside the js directory.
* js - This directory contains the both Leo types, JS types, `js2leo` (Leo type to Js type conversion), `leo2js` (JS type to Leo type conversion). For each of the program, it also creates <PROGRAM-NAME>.ts file that contains all the transitions and mappings of the program.
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
    
## Conclustion    
This documentation provides a comprehensive guide to installing Aleo.js, starting a project, adding programs, compiling, running tests, and deploying programs. Happy coding with Aleo.js!

--------------
    
## Advanced Testing (WIP)
Create a test file (e.g., token.test.ts) inside the test directory. An example test file is provided below: 

```js
import { TokenContract } from '../artifacts/js/token';
// mode is explicitly defined here, execute mode is given as value to execute the transactions in chain. If mode is not given, default of aleo-config.js is used. 
const Token = new TokenContract({mode: "execute"});
// for execution of Token program through different wallet
const Token_from_aleoUser3 = new TokenContract({mode: "execute", networkName: "testnet3", privateKey: "APrivateKey1zkp2GUmKbVsuc1NSj28pa1WTQuZaK5f1DQJAT6vPcHyWokG"});

describe("Token Testing", () => {
let tx;
// // User address on Aleo
const aleoUser1 = "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px";
const aleoUser2 = "aleo1s3ws5tra87fjycnjrwsjcrnw2qxr8jfqqdugnf0xzqqw29q9m5pqem2u4t";
const aleoUser3 = "aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg"


const Timeout = 200_000;

test("should deploy", async() => {
// program deployment
tx = await Token.deploy();
// @ts-ignore
// transaction takes time to broadcast so we have to wait until transaction is completed 
await tx.wait();
}, Timeout);

test("should mint publicly", async () => {
// minting publicly to aleuouser2 wallet
tx = Token.mint_public(aleoUser2, BigInt(500));
await tx.wait();
// checking balance of aleouser2 to see token has minted or not
expect(Token.account(aleoUser2)).toBe(BigInt(500));
}, Timeout);

test("should not transfer publicly if account has not balance", async() => {
// executing transfer public
tx = await Token_from_aleoUser3.transfer_public(aleoUser2, BigInt(500));
const receipt = tx.wait();
// expecting the transaction will fail. In this case transaction is said to be failed in finalize block so failed transaction will be broadcasted which we expect
expect(receipt.error).toBeTruthy();
}, Timeout);

test("should transfer publicly", async() => {
// minting for balance
tx = Token.mint_public(aleoUser1, BigInt(500));
await tx.wait();
// transfer public
tx = await Token.transfer_public(aleoUser1, BigInt(250));
await tx.wait();
expect(Token.account(aleoUser3)).toBe(BigInt(250));
expect(Token.account(aleoUser1)).toBe(BigInt(250));
}, Timeout);

});
```

**Execute the test file:**
>     npm test -- --runInBand token.test.ts
