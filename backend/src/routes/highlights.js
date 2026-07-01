const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  // TODO: Wire to a real video highlights data source (e.g., SportRadar highlights API)
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Video highlights are not yet available. Coming soon with SportRadar/Cloudinary integration.' },
  })
})

module.exports = router
