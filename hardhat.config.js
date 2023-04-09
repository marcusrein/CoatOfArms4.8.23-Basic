require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()
require('./tasks/block-number')

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.18',
    optimizer: { enabled: true, runs: 100 },
    networks: {
        mumbai: {
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
            chainId: 80001,
        },
        localhost: {
            url: 'http://127.0.0.1:8545/',
            chainId: 31337,
        },
    },
    defaultNetwork: 'hardhat',
    etherscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
}
