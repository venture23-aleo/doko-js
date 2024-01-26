import { ContractConfig, snarkDeploy } from "@aleojs/core";
import networkConfig from '../aleo-config'

export class BaseContract {
    public config: ContractConfig = {};

    constructor(config: ContractConfig) {
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
                throw Error(`Network config not defined for ${networkName}.Please add the config in aleo - config.js file in root directory`)

            this.config = {
                ...this.config,
                network: networkConfig.networks[networkName]
            };
        }

        if (!this.config.privateKey && networkName)
            this.config.privateKey = networkConfig.networks[networkName].accounts[0];
    }

    async deploy(): Promise<any> {
        const result = await snarkDeploy({
            config: this.config,
        });

        return result;
    }

}