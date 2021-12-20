require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: 'REPO_PRIVATE_KEY',
      accounts: ['ACCOUNT_NO'],
    },
  },
};