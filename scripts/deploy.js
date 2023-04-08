const hre = require('hardhat')
const { uploadToPinata } = require('./utils/uploadToPinata')
require('dotenv').config()

async function main() {
    const imagesLocation = './images'
    const CoatOfArms = await ethers.getContractFactory('CoatOfArms')
    const coatOfArms = await CoatOfArms.deploy()
    await coatOfArms.deployed()
    await console.log('CoatOfArms deployed to:', coatOfArms.address)
    let tokenUris
    await uploadToPinata(imagesLocation)

    if (process.env.UPLOAD_TO_PINATA == 'true') {
        tokenUris = await handleTokenUris()
    }
}

async function handleTokenUris() {
    tokenUris = []

    return tokenUris
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
