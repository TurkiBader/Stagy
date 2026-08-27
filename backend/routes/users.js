const express = require('express')
const router = express.Router()
const { getStudentProfile, updateStudentProfile, getMatches, getStudentStats, getCompanyProfile, updateCompanyProfile, uploadCV, deleteCV } = require('../controllers/userController')
const { upload } = require('../config/upload')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.get('/:id', getStudentProfile)
router.put('/:id', updateStudentProfile)
router.get('/:studentId/matches', getMatches)
router.get('/:id/stats', getStudentStats)
router.get('/:user_id/company', getCompanyProfile)
router.put('/:user_id/company', updateCompanyProfile)

// CV upload — 'cv' must match the FormData field name used on the frontend
router.post('/:id/cv', (req, res) => {
  upload.single('cv')(req, res, (err) => {
    if (err) {
      // Multer errors (file too large, wrong type, etc.) land here
      return res.status(400).json({ message: err.message })
    }
    uploadCV(req, res)
  })
})
router.delete('/:id/cv', deleteCV)

module.exports = router