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
    console.log('Files!!!!: ', files)
    let responses = []
    for (fileIndex in files) {
        const imagePath = `${fullImagesPath}/${files[fileIndex]}`
        const image = await Jimp.read(imagePath)
        pixelate(image.bitmap.data, image.bitmap.width, image.bitmap.height, 16) // 16 is the pixelation size
        try {
            const response = await pinata.pinFileToIPFS(
                fs.createReadStream(imagePath),
                options
            )
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
