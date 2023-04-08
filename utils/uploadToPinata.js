const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function uploadToPinata(filePath) {
    const fullImagesPath = path.resolve(filePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
    let responses = []
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch {
            ;(err) => {
                console.log(err)
            }
        }
    }
}

module.exports = { uploadToPinata }
