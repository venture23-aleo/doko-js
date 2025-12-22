import dotenv from 'dotenv';
dotenv.config();

export default {
  accounts: [process.env.ALEO_PRIVATE_KEY],
  mode: 'execute',
  networks: {
    devnet: {
      network: 'testnet',
      endpoint: 'http://localhost:3030',
      accounts: [
        process.env.ALEO_PRIVATE_KEY_TESTNET3,
        process.env.ALEO_DEVNET_PRIVATE_KEY2
      ],
      priorityFee: 0.01
    },
    testnet: {
      network: 'testnet',
      endpoint: 'https://api.explorer.provable.com/v1',
      accounts: [
        process.env.ALEO_PRIVATE_KEY_TESTNET3,
        process.env.ALEO_DEVNET_PRIVATE_KEY2
      ],
      priorityFee: 0.01
    },
    mainnet: {
      network: 'mainnet',
      endpoint: 'https://api.explorer.provable.com/v1',
      accounts: [process.env.ALEO_PRIVATE_KEY_MAINNET],
      priorityFee: 0.001
    }
  },
  defaultNetwork: 'devnet'
};
