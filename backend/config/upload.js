const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads', 'cv')

// Make sure the folder exists (won't error if it already does)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const userId = req.params.id
    const ext = path.extname(file.originalname)
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 50)
    const uniqueName = `${userId}-${Date.now()}-${safeBase}${ext}`
    cb(null, uniqueName)
  },
})

const allowedTypes = ['.pdf', '.doc', '.docx']

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedTypes.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, DOC, or DOCX files are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

module.exports = { upload, uploadDir }