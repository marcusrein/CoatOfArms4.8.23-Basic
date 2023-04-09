const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const pixelit = require('pixelit')

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
    console.log('Files!!!!: ', files)
    let responses = []
    for (fileIndex in files) {
        const imagePath = `${fullImagesPath}/${files[fileIndex]}`
        const pixelatedImagePath = `./images/pixelated/${files[fileIndex]}`

        const pixelatedImage = new pixelit()

        pixelatedImage
            .setDrawFrom(imagePath)
            .setDrawTo(pixelatedImagePath)
            .setPixelSize(10)
            .draw()

        try {
            const response = await pinata.pinFileToIPFS(pixelatedImage, options)
            responses.push(response)
        } catch (err) {
            console.log(err)
        }
    }
    return responses
}

async function handleTokenUris(responses) {
    console.log('Responses: ', responses)
    const tokenUris = responses.map((response) => {
        return `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`
    })

    return tokenUris
}

module.exports = { storeImages, handleTokenUris }
