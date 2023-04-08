require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.18',
    optimizer: { enabled: true, runs: 100 },
    networks: {
        mumbai: {
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
        },
    },
    defaultNetwork: 'hardhat',
    etherscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
}
