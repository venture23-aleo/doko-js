# AleoJS
> EthersJS (+Hardhat) for the Aleo ecosystem

AleoJS library aims to be a simple and compact library for interacting with the Aleo blockchain and its ecosystem. It’ll fully leverage the existing tools and provide an easy to use interface to anyone who wants to build on top of Aleo.

## Installation and Setup

1. Clone the current repository
```sh
git clone git@github.com:venture23-zkp/aleojs.git
```

2. Move inside the repository
```sh
cd aleojs
```

2. Install the necessary packages
```sh
npm install
```

3. Build the project
```sh
npm run build
```

4. Install the project globally
```sh
npm install -g .
```

To check if the installation is successful, try running `aleojs-dev` command.

The expected output is the following:
```
Using shell: /bin/zsh
     _    _                _ ____  
    / \  | | ___  ___     | / ___| 
   / _ \ | |/ _ \/ _ \ _  | \___ \ 
  / ___ \| |  __/ (_) | |_| |___) |
 /_/   \_\_|\___|\___/ \___/|____/ 
                                   
Usage: index [options] [command]

AleoJS CLI

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init            Initialize your AleoJS project
  add [options]   Add a new component or resource
  compile         Compile your AleoJS project
  run             Run your AleoJS project
  help [command]  display help for command
```

> Incase the `aleojs-dev` is not found or there is some issue, replace `aleojs-dev` with `node <LOCATION-TO-ALEOJS>/dist/index.js`.

Example:
```sh
node ../aleojs/dist/index.js init demo
```