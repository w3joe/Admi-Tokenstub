// server.js (ESM, plain JS)
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pinataSDK from '@pinata/sdk'
import dotenv from 'dotenv'
import { Readable } from 'stream'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// CORS (no credentials used, so '*' is fine)
app.use(cors({ origin: '*' }))
app.use(express.json())

console.log('Backend server starting...')
console.log('Pinata API Key:', process.env.PINATA_API_KEY ? 'Loaded' : 'Not Loaded')
console.log('Pinata API Secret:', process.env.PINATA_API_SECRET ? 'Loaded' : 'Not Loaded')
console.log('Pinata JWT:', process.env.PINATA_JWT ? 'Loaded' : 'Not Loaded')

// Multer in-memory storage so req.file.buffer exists
const upload = multer({ storage: multer.memoryStorage() })

// ---- Pinata init (JWT preferred, fallback to key/secret) ----
const pinata = process.env.PINATA_JWT
  ? new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
  : new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)

// Verify credentials at startup (helps surface bad keys early)
;(async () => {
  try {
    const auth = await pinata.testAuthentication?.()
    console.log('Pinata auth OK:', auth || 'ok')
  } catch (e) {
    console.error('Pinata authentication FAILED. Check env vars.', e)
  }
})()

// Health
app.get('/health', (_req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ ok: true, ts: Date.now() })
})

// Main endpoint to pin the image and metadata
app.post('/api/pin-image', upload.single('file'), async (req, res) => {
  console.log('API endpoint /api/pin-image was hit!')
  try {
    const file = req.file
    if (!file) {
      console.log('Error: No file uploaded.')
      return res.status(400).json({ error: 'No file uploaded' })
    }
    console.log('File received:', {
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    })

    // 1) Buffer -> Readable stream for Pinata
    const stream = Readable.from(file.buffer)
    // Give Pinata a filename hint
    // @ts-ignore (JS file): attach path so sdk has a name
    stream.path = file.originalname || 'upload'

    const imageOptions = {
      pinataMetadata: { name: file.originalname || 'MasterPass Ticket Image' },
    }
    const imageResult = await pinata.pinFileToIPFS(stream, imageOptions)
    const imageUrl = `ipfs://${imageResult.IpfsHash}`
    console.log('Image pinned to IPFS:', imageUrl)

    // 2) NFT metadata JSON
    const metadata = {
      name: 'NFT Example',
      description: 'This is an unchangeable NFT',
      image: imageUrl,
      properties: {},
    }

    const jsonOptions = { pinataMetadata: { name: 'MasterPass Ticket Metadata' } }
    const jsonResult = await pinata.pinJSONToIPFS(metadata, jsonOptions)
    const metadataUrl = `ipfs://${jsonResult.IpfsHash}`
    console.log('Successfully pinned metadata. URL:', metadataUrl)

    // 3) Respond
    res.status(200).json({ metadataUrl })
    console.log('Response sent to frontend.')
  } catch (error) {
    // Deep error logging to see Pinata details
    const details = {
      message: error?.message,
      status: error?.status || error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack,
    }
    console.error('Error in /api/pin-image:', details)

    const msg =
      (typeof details.data === 'string' && details.data) ||
      details.data?.error ||
      details.message ||
      'Failed to pin to IPFS.'
    res.status(500).json({ error: msg })
  }
})

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`)
})
