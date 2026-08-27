const express = require('express')
const router = express.Router()
const { applyToInternship, getStudentApplications, saveInternship, getSavedCount, updateApplicationStatus, withdrawApplication } = require('../controllers/applicationController')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.post('/', applyToInternship)
router.get('/:student_id', getStudentApplications)
router.post('/save', saveInternship)
router.get('/:student_id/saved-count', getSavedCount)
router.put('/:id/status', updateApplicationStatus)
router.delete('/:id', withdrawApplication)

module.exports = router