const hre = require('hardhat')
const { ethers, run, network } = require('hardhat')
require('@nomiclabs/hardhat-etherscan')
const { storeImages } = require('../utils/uploadToPinata')
require('dotenv').config()

const imagesLocation = './images'

async function main() {
    // get IPFS hashes of our images
    let tokenUris
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
        tokenUris = await handleTokenUris()
    }

    await storeImages(imagesLocation)
    // Deploy CoatOfArms

    const CoatOfArmsFactory = await ethers.getContractFactory('CoatOfArms')
    console.log('Deploying CoatOfArms...')
    const coatOfArms = await CoatOfArmsFactory.deploy()
    await coatOfArms.deployed()
    const signers = await ethers.getSigners()
    await console.log('CoatOfArms deployed to:', coatOfArms.address)
    // console.log('Signers of coat of Arms: ', signers)

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

    // console.log('Added member Response: ', addMemberResponse)

    const addMemberReceipt = await addMemberResponse.wait()

    // console.log('AddMember Receipt: ', addMemberReceipt)

    const safeMintResponse = await coatOfArms.safeMint(
        signers[0].address,
        signers[1].address,
        1,
        tokenUris[0]
    )
    // console.log('SafeMint Response: ', safeMintResponse)

    console.log(
        `CoatOfArms minted from ${signers[0].address} to: ${signers[1].address}`
    )

    const newMemberEvent = addMemberReceipt.events.find(
        (event) => event.event === 'NewMemberAdded'
    )

    // console.log('NewMemberAdded Event:', newMemberEvent)
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

async function handleTokenUris() {
    // Call storeImages function and collect the responses
    const responses = await storeImages(imagesLocation)

    // Map the responses to construct token URIs
    const tokenUris = responses.map((response) => {
        return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
    })

    return tokenUris
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
