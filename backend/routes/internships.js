const express = require('express')
const router = express.Router()
const {
  getAllInternships,
  getInternshipById,
  createInternship,
  deleteInternship,
  getCompanyInternships,
  getCompanyApplications,
  getInternshipApplications,
  updateInternshipStatus
} = require('../controllers/internshipController')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.get('/', getAllInternships)
router.get('/company/:company_id', getCompanyInternships)
router.get('/company/:company_id/applications', getCompanyApplications)
router.get('/:id/applications', getInternshipApplications)
router.get('/:id', getInternshipById)
router.post('/', createInternship)
router.put('/:id/status', updateInternshipStatus)
router.delete('/:id', deleteInternship)

module.exports = router