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
  defaultNetwork: 'testnet',
  networkMode: 1
};
