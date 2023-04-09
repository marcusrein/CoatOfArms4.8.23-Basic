const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)
const options = {
    pinataMetadata: {
        name: 'TestPhoto',
        keyvalues: {
            powerWord1: 'power',
            powerWord2: 'amazing',
            emotion1: 'happy',
            emotion2: 'elated',
        },
    },
    pinataOptions: {
        cidVersion: 0,
    },
}

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
    let responses = []
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFile,
                options
            )
            responses.push(response)
        } catch (err) {
            console.log(err)
        }
    }
    console.log('Responsessssss: ', responses)
    // Return the responses array
    return responses
}

async function handleTokenUris(responses) {
    const imagesLocation = './images'
    console.log('Responses: ', responses)
    const tokenUris = responses.map((response) => {
        return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
    })

    return tokenUris
}

module.exports = { storeImages, handleTokenUris }
