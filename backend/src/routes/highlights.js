const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ highlights: [
    { id: '1', title: 'Haaland Hat-trick vs Ipswich', sport: 'FOOTBALL', competition: 'Premier League', duration: '3:42', thumbnailUrl: null, videoUrl: null },
    { id: '2', title: 'LeBron Game-Winner vs Celtics', sport: 'BASKETBALL', competition: 'NBA', duration: '2:18', thumbnailUrl: null, videoUrl: null },
    { id: '3', title: 'Mahomes 4th Quarter Comeback', sport: 'AMERICAN_FOOTBALL', competition: 'NFL', duration: '5:01', thumbnailUrl: null, videoUrl: null },
  ]})
})

module.exports = router
