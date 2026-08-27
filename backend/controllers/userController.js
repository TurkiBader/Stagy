const db = require('../config/db')
const path = require('path')
const fs = require('fs')
const { uploadDir } = require('../config/upload')

// Upload / replace a student's CV
const uploadCV = (req, res) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  // Find the student's profile + existing CV (if any), so we can clean it up
  db.query(
    'SELECT id, cv_url FROM student_profiles WHERE user_id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) {
        return res.status(404).json({ message: 'Student profile not found' })
      }

      const oldCvUrl = results[0].cv_url
      const newCvUrl = `/uploads/cv/${req.file.filename}`

      db.query(
        'UPDATE student_profiles SET cv_url = ? WHERE user_id = ?',
        [newCvUrl, id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error saving CV' })

          // Best-effort cleanup of the previous file
          if (oldCvUrl) {
            const oldFilePath = path.join(uploadDir, path.basename(oldCvUrl))
            fs.unlink(oldFilePath, () => {})
          }

          res.json({
            message: 'CV uploaded successfully!',
            cv_url: newCvUrl,
            original_name: req.file.originalname,
          })
        }
      )
    }
  )
}

// Delete a student's CV
const deleteCV = (req, res) => {
  const { id } = req.params

  db.query(
    'SELECT cv_url FROM student_profiles WHERE user_id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) {
        return res.status(404).json({ message: 'Student profile not found' })
      }

      const cvUrl = results[0].cv_url
      if (!cvUrl) {
        return res.status(400).json({ message: 'No CV to delete' })
      }

      db.query(
        'UPDATE student_profiles SET cv_url = NULL WHERE user_id = ?',
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error deleting CV' })

          const filePath = path.join(uploadDir, path.basename(cvUrl))
          fs.unlink(filePath, () => {})

          res.json({ message: 'CV deleted successfully!' })
        }
      )
    }
  )
}

// Get student profile
const getStudentProfile = (req, res) => {
  const { id } = req.params

  db.query(
    'SELECT users.full_name, users.email, student_profiles.* FROM users JOIN student_profiles ON users.id = student_profiles.user_id WHERE users.id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.status(404).json({ message: 'Student not found' })
      res.json(results[0])
    }
  )
}

// Update student profile
const updateStudentProfile = (req, res) => {
  const { id } = req.params
  const { university, location, bio, skills } = req.body

  db.query(
    'UPDATE student_profiles SET university = ?, location = ?, bio = ?, skills = ? WHERE user_id = ?',
    [university, location, bio, skills, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating profile' })
      res.json({ message: 'Profile updated successfully!' })
    }
  )
}

// Get matches for a student
const getMatches = (req, res) => {
  const { studentId } = req.params

  // First get the student's skills
  db.query(
    'SELECT skills FROM student_profiles WHERE user_id = ?',
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.status(404).json({ message: 'Student not found' })

      const studentSkills = results[0].skills
        ? results[0].skills.toLowerCase().split(',').map(s => s.trim())
        : []

      // Get all active internships
      db.query(
        'SELECT internships.*, companies.company_name FROM internships JOIN companies ON internships.company_id = companies.id WHERE internships.status = "active"',
        (err, internships) => {
          if (err) return res.status(500).json({ message: 'Database error' })

          // Calculate match score for each internship
          const matches = internships.map(internship => {
            const requiredSkills = internship.skills_required
              ? internship.skills_required.toLowerCase().split(',').map(s => s.trim())
              : []

            // Find matching skills
            const matchingSkills = requiredSkills.filter(skill =>
              studentSkills.includes(skill)
            )

            // Calculate percentage
            const matchScore = requiredSkills.length > 0
              ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
              : 0

            return {
              ...internship,
              match_score: matchScore,
              matching_skills: matchingSkills,
              total_required: requiredSkills.length
            }
          })

          // Sort by match score highest first
          matches.sort((a, b) => b.match_score - a.match_score)

          res.json(matches)
        }
      )
    }
  )
}
      // Get student stats
const getStudentStats = (req, res) => {
  const { id } = req.params

  db.query(
    'SELECT id FROM student_profiles WHERE user_id = ?',
    [id],
    (err, profileResults) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (profileResults.length === 0) return res.json({ applications_sent: 0, interviews: 0, saved_roles: 0, new_internships: 0 })

      const student_profile_id = profileResults[0].id

      db.query(
        'SELECT COUNT(*) as total FROM applications WHERE student_id = ?',
        [student_profile_id],
        (err, totalResults) => {
          if (err) return res.status(500).json({ message: 'Database error' })

          db.query(
            'SELECT COUNT(*) as interviewing FROM applications WHERE student_id = ? AND status = "interviewing"',
            [student_profile_id],
            (err, interviewResults) => {
              if (err) return res.status(500).json({ message: 'Database error' })

              db.query(
                'SELECT COUNT(*) as new_internships FROM internships WHERE status = "active" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
                (err, newResults) => {
                  if (err) return res.status(500).json({ message: 'Database error' })

                  db.query(
                    'SELECT COUNT(*) as saved FROM saved_internships WHERE student_id = ?',
                    [student_profile_id],
                    (err, savedResults) => {
                      if (err) return res.status(500).json({ message: 'Database error' })

                      res.json({
                        applications_sent: totalResults[0].total,
                        interviews: interviewResults[0].interviewing,
                        saved_roles: savedResults[0].saved,
                        new_internships: newResults[0].new_internships
                      })
                    }
                  )
                }
              )
            }
          )
        }
      )
    }
  )
}
// Get company profile
const getCompanyProfile = (req, res) => {
  const { user_id } = req.params

  db.query(
    'SELECT * FROM companies WHERE user_id = ?',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.status(404).json({ message: 'Company not found' })
      res.json(results[0])
    }
  )
}

// Update company profile
const updateCompanyProfile = (req, res) => {
  const { user_id } = req.params
  const { company_name, location, description } = req.body

  db.query(
    'UPDATE companies SET company_name = ?, location = ?, description = ? WHERE user_id = ?',
    [company_name, location, description, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Company not found' })
      }
      res.json({ message: 'Company profile updated successfully!' })
    }
  )
}

module.exports = { getStudentProfile, updateStudentProfile, getMatches, getStudentStats, getCompanyProfile, updateCompanyProfile, uploadCV, deleteCV }