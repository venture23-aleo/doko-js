export const ALEO_CONFIG = `
import dotenv from 'dotenv';
dotenv.config();

export default {
  accounts: [process.env.ALEO_PRIVATE_KEY],
  mode: 'execute',
  mainnet: {},
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
  },
  defaultNetwork: 'testnet'
};
`
export const BASE_CONTRACT = `
import { PrivateKey } from '@provablehq/sdk';
import {
  ContractConfig,
  snarkDeploy,
  checkDeployment,
  CreateExecutionContext,
  TransactionResponse,
  ExecutionContext
} from '@doko-js/core';
import networkConfig from '../aleo-config';
import { to_address } from '@doko-js/wasm';

export class BaseContract {
  // @ts-expect-error Initialized at constructor
  public config: ContractConfig = {};
  public ctx: ExecutionContext;

  constructor(config: Partial<ContractConfig>) {
    if (config) {
      this.config = {
        ...this.config,
        ...config
      };
    }

    if (!this.config.networkName)
      this.config.networkName = networkConfig.defaultNetwork;

    const networkName = this.config.networkName;
    if (networkName) {
      if (!networkConfig?.networks[networkName])
        throw Error(
          \`Network config not defined for \${networkName}.Please add the config in aleo - config.js file in root directory\`
        );

      this.config = {
        ...this.config,
        network: networkConfig.networks[networkName]
      };
    }

    if (!this.config.privateKey && networkName)
      this.config.privateKey = networkConfig.networks[networkName].accounts[0];

    this.ctx = CreateExecutionContext(this.config);
  }

  async isDeployed(): Promise<boolean> {
    const endpoint = \`\${this.config.network.endpoint}/\${this.config.networkName}/program/\${this.config.appName}.aleo\`;
    return checkDeployment(endpoint);
  }

  /**
   * @deprecated Use transaction receipt to wait.
   */

  async wait<T extends TransactionResponse = TransactionResponse>(
    transaction: T
  ): Promise<T> {
    return transaction.wait();
  }

  async deploy(): Promise<any> {
    const result = await snarkDeploy({
      config: this.config
    });

    return result;
  }

  address(): string {
    return to_address(\`\${this.config.appName}.aleo\`, this.config.networkName);
  }

  // TODO: handle properly
  getAccounts(): string[] {
    const accounts = this.config.network.accounts.map((pvtKey) => {
      return PrivateKey.from_string(pvtKey).to_address().to_string();
    });
    return accounts;
  }

  getDefaultAccount(): string {
    return PrivateKey.from_string(this.config.privateKey)
      .to_address()
      .to_string();
  }

  getPrivateKey(address: string) {
    return this.config.network.accounts.find(
      (pvtKey: string) =>
        PrivateKey.from_string(pvtKey).to_address().to_string() == address
    );
  }

  // TODO: Handle properly
  connect(account: string) {
    const accounts = this.config.network.accounts.map((pvtKey) => {
      return PrivateKey.from_string(pvtKey).to_address().to_string();
    });
    const accountIndex = accounts.indexOf(account);
    if (accountIndex == -1) {
      throw Error(\`Account \${account} not found!\`);
    } else {
      this.config.privateKey = this.config.network.accounts[accountIndex];
    }
  }
}
`

export const EDITOR_README =
  `Click on \`+\` icon next to \`INPUTS\` section to add file.

Click on \`▶️\` icon next to \`OUTPUTS\` section to compile the files

You can select the files to view it on editor.
Editor is read-only

You can right-click the files in \`INPUTS\` section to delete the files you added.`

export const SAMPLE_PROGRAM = 
`
program sample_program.aleo;

function main:
    input r0 as u32;
    input r1 as u32;
    add r0,r1 into r2;
    output r2 as u32;
`