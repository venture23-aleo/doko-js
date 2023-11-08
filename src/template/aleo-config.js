module.exports = {
  accounts: [process.env.ALEO_PK],
  mainnet: {},
  testnet: {
    node: 'https://vm.aleo.org/api/',
    server: {
      host: '0.0.0.0',
      port: 4040
    }
  }
};
