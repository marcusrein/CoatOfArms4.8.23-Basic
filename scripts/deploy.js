const hre = require('hardhat')
const { ethers, run, network } = require('hardhat')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()
const { storeImages, handleTokenUris } = require('../utils/uploadToPinata')

async function main() {
    // get IPFS hashes of our images
    let tokenUris

    if (process.env.UPLOAD_TO_PINATA) {
        const imagesLocation = './images'

        console.log('Uploading images to Pinata...')
        imageUploadResponse = await storeImages(imagesLocation)
        tokenUris = await handleTokenUris(imageUploadResponse)
        console.log('Token URIs: ', tokenUris)
        return tokenUris
    }
    // Deploy CoatOfArms

    const CoatOfArmsFactory = await ethers.getContractFactory('CoatOfArms')
    console.log('Deploying CoatOfArms...')
    const coatOfArms = await CoatOfArmsFactory.deploy()
    await coatOfArms.deployed()
    const signers = await ethers.getSigners()
    await console.log('CoatOfArms deployed to:', coatOfArms.address)

    // Verify if on Polygon

    if (network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
        await coatOfArms.deployTransaction.wait(5)
        await verify(coatOfArms.address, [])
    }

    // Interact with CoatOfArms

    console.log('Adding member... ')
    const addMemberResponse = await coatOfArms.addMember(
        signers[0].address,
        signers[1].address
    )

    const addMemberReceipt = await addMemberResponse.wait()

    console.log(
        `CoatOfArms minted from ${signers[0].address} to: ${signers[1].address}`
    )

    const newMemberEvent = addMemberReceipt.events.find(
        (event) => event.event === 'NewMemberAdded'
    )
}

async function verify(contractAddress, args) {
    console.log('Verifying contract...')
    try {
        await run('verify:verify', {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.includes('Contract source code already verified')) {
            console.log('Contract already verified')
        } else {
            console.log('There was an error when verifying:', error)
        }
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
