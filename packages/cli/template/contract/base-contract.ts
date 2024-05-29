// @ts-nocheck
import { PrivateKey, TransactionModel } from '@aleohq/sdk';
import {
  ContractConfig,
  snarkDeploy,
  checkDeployment,
  CreateExecutionContext,  
  TransactionResponse
} from '@doko-js/core';
import { to_address } from 'aleo-program-to-address';
import networkConfig from '../aleo-config';

export class BaseContract {
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
    if (!this.config.networkMode)
      this.config.networkMode = networkConfig.networkMode;
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

  async isDeployed(): Promise<boolean> {
    const endpoint = `${this.config.network.endpoint}/${this.config.networkName}/program/${this.config.appName}.aleo`;
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
    return to_address(`${this.config.appName}.aleo`);
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
      throw Error(`Account ${account} not found!`);
    } else {
      this.config.privateKey = this.config.network.accounts[accountIndex];
    }
  }
}
