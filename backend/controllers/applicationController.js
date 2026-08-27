const db = require('../config/db')
const { createNotification } = require('./notificationController')

const VALID_STATUSES = ['pending', 'shortlisted', 'interviewing', 'accepted', 'rejected']

// Company updates an application's status (e.g. shortlist, interview, accept, reject)
const updateApplicationStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    })
  }

  db.query(
    'UPDATE applications SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Application not found' })
      }

      res.json({ message: 'Status updated successfully!', status })

      // Notify the student — best-effort, doesn't block the response above
      const infoQuery = `
        SELECT users.id AS student_user_id, internships.title
        FROM applications
        JOIN student_profiles ON applications.student_id = student_profiles.id
        JOIN users ON student_profiles.user_id = users.id
        JOIN internships ON applications.internship_id = internships.id
        WHERE applications.id = ?
      `
      db.query(infoQuery, [id], (err, rows) => {
        if (err || rows.length === 0) return
        const { student_user_id, title } = rows[0]
        createNotification(
          student_user_id,
          `Your application for "${title}" was marked as ${status}.`,
          '/student/applications'
        )
      })
    }
  )
}

// Student applies to an internship
const applyToInternship = (req, res) => {
  const { student_id, internship_id, match_score } = req.body

  // First get the student_profile id from user_id
  db.query(
    'SELECT id FROM student_profiles WHERE user_id = ?',
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.status(404).json({ message: 'Student profile not found' })

      const student_profile_id = results[0].id

      // Check if already applied
      db.query(
        'SELECT * FROM applications WHERE student_id = ? AND internship_id = ?',
        [student_profile_id, internship_id],
        (err, existing) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          if (existing.length > 0) {
            return res.status(400).json({ message: 'You already applied to this internship' })
          }

          // Save application
          db.query(
            'INSERT INTO applications (student_id, internship_id, match_score) VALUES (?, ?, ?)',
            [student_profile_id, internship_id, match_score],
            (err, result) => {
              if (err) return res.status(500).json({ message: 'Error applying' })
              res.status(201).json({ message: 'Applied successfully!' })

              // Notify the company that owns this internship — best-effort
              const infoQuery = `
                SELECT companies.user_id AS company_user_id, internships.title, users.full_name AS student_name
                FROM internships
                JOIN companies ON internships.company_id = companies.id
                JOIN student_profiles ON student_profiles.id = ?
                JOIN users ON student_profiles.user_id = users.id
                WHERE internships.id = ?
              `
              db.query(infoQuery, [student_profile_id, internship_id], (err, rows) => {
                if (err || rows.length === 0) return
                const { company_user_id, title, student_name } = rows[0]
                createNotification(
                  company_user_id,
                  `${student_name} applied to "${title}".`,
                  `/company/offer/${internship_id}`
                )
              })
            }
          )
        }
      )
    }
  )
}

// Student withdraws an application they no longer want to pursue
const withdrawApplication = (req, res) => {
  const { id } = req.params

  db.query('DELETE FROM applications WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found' })
    }
    res.json({ message: 'Application withdrawn.' })
  })
}

// Get all applications for a student
const getStudentApplications = (req, res) => {
  const { student_id } = req.params

  // First get student_profile id from user_id
  db.query(
    'SELECT id FROM student_profiles WHERE user_id = ?',
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.json([])

      const student_profile_id = results[0].id

      const query = `
        SELECT 
          applications.*,
          internships.title,
          internships.location,
          internships.salary,
          internships.duration,
          companies.company_name,
          company_users.email AS company_email
        FROM applications
        JOIN internships ON applications.internship_id = internships.id
        JOIN companies ON internships.company_id = companies.id
        JOIN users AS company_users ON companies.user_id = company_users.id
        WHERE applications.student_id = ?
        ORDER BY applications.applied_at DESC
      `

      db.query(query, [student_profile_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' })
        res.json(results)
      })
    }
  )
}
// Save an internship
const saveInternship = (req, res) => {
  const { student_id, internship_id } = req.body

  db.query(
    'SELECT id FROM student_profiles WHERE user_id = ?',
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.status(404).json({ message: 'Student not found' })

      const student_profile_id = results[0].id

      // Check if already saved
      db.query(
        'SELECT * FROM saved_internships WHERE student_id = ? AND internship_id = ?',
        [student_profile_id, internship_id],
        (err, existing) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          if (existing.length > 0) {
            return res.status(400).json({ message: 'Already saved' })
          }

          db.query(
            'INSERT INTO saved_internships (student_id, internship_id) VALUES (?, ?)',
            [student_profile_id, internship_id],
            (err) => {
              if (err) return res.status(500).json({ message: 'Error saving' })
              res.status(201).json({ message: 'Internship saved!' })
            }
          )
        }
      )
    }
  )
}

// Get saved internships count
const getSavedCount = (req, res) => {
  const { student_id } = req.params

  db.query(
    'SELECT id FROM student_profiles WHERE user_id = ?',
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (results.length === 0) return res.json({ count: 0 })

      const student_profile_id = results[0].id

      db.query(
        'SELECT COUNT(*) as count FROM saved_internships WHERE student_id = ?',
        [student_profile_id],
        (err, results) => {
          if (err) return res.status(500).json({ message: 'Database error' })
          res.json({ count: results[0].count })
        }
      )
    }
  )
}

module.exports = { applyToInternship, getStudentApplications, saveInternship, getSavedCount, updateApplicationStatus, withdrawApplication }