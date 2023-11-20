module.exports = {
  accounts: [process.env.ALEO_PRIVATE_KEY],
  mainnet: {},
  testnet: {
    node: 'https://vm.aleo.org/api/',
    server: {
      host: '0.0.0.0',
      port: 4040
    }
  },
  devnet: {
    node: 'http://localhost:4040',
    server: {}
  }
};
