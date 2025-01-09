import { PrivateKey } from '@provablehq/sdk';
import {
  ContractConfig,
  snarkDeploy,
  checkDeployment,
  CreateExecutionContext,
  TransactionResponse,
  ExecutionContext
} from '@doko-js/core';
import { to_address } from 'aleo-program-to-address';
import networkConfig from '../aleo-config';

export class BaseContract {
  // @ts-expect-error Initialized at constructor
  public config: ContractConfig = {};
  public ctx: ExecutionContext;

  /**
   * @description - Initializes the contract with the given configuration.
   * @param config - Partial configuration object for the contract from aleo-config.js.
  */
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
          `Network config not defined for ${networkName}.Please add the config in aleo - config.js file in root directory`
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

  /**
   * @description - Checks if the program is deployed.
   * @returns - Promise resolving to a boolean indicating deployment status.
   */
  async isDeployed(): Promise<boolean> {
    const endpoint = `${this.config.network.endpoint}/${this.config.networkName}/program/${this.config.appName}.aleo`;
    return checkDeployment(endpoint);
  }

  /**
   * @deprecated - Use transaction receipt to wait.
   * @description - Waits for a transaction to complete.
   * @param transaction - The transaction object.
   * @returns - Promise resolving to the transaction response.
   */
  async wait<T extends TransactionResponse = TransactionResponse>(
    transaction: T
  ): Promise<T> {
    return transaction.wait();
  }

  /**
   * @description - Deploys the program to the network.
   * @returns - Promise resolving to the deployment result.
   */
  async deploy(): Promise<any> {
    const result = await snarkDeploy({
      config: this.config
    });

    return result;
  }

  /**
   * @description - Retrieves the program's address.
   * @returns - The address of the program.
   */
  address(): string {
    return to_address(`${this.config.appName}.aleo`);
  }

  // TODO: handle properly
  /**
   * @description - Retrieves all accounts associated with the program's network.
   * @returns - Array of account addresses.
   */
  getAccounts(): string[] {
    const accounts = this.config.network.accounts.map((pvtKey) => {
      return PrivateKey.from_string(pvtKey).to_address().to_string();
    });
    return accounts;
  }

  /**
   * @description - Retrieves the default account address.
   * @returns - The address of the default account.
   */
  getDefaultAccount(): string {
    return PrivateKey.from_string(this.config.privateKey)
      .to_address()
      .to_string();
  }

  /**
   * @description - Retrieves the private key for a given account address.
   * @param address - The address of the account.
   * @returns - The private key of the account, if found.
   */
  getPrivateKey(address: string) {
    return this.config.network.accounts.find(
      (pvtKey: string) =>
        PrivateKey.from_string(pvtKey).to_address().to_string() == address
    );
  }

  /**
   * @description - Connects to a specified account by its address.
   * @param account - The address of the account to connect to.
   * @throws - Error if the account is not found.
   */  connect(account: string) {
    const accounts = this.config.network.accounts.map((pvtKey) => {
      return PrivateKey.from_string(pvtKey).to_address().to_string();
    });
    const accountIndex = accounts.indexOf(account);
    if (accountIndex == -1) {
      throw Error(`Account ${account} not found!`);
    } else {
      this.config.privateKey = this.config.network.accounts[accountIndex];
    }
  }
}
