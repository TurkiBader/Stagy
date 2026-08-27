const db = require('../config/db')

// Get all internships
const getAllInternships = (req, res) => {
  const query = `
    SELECT internships.*, companies.company_name 
    FROM internships 
    JOIN companies ON internships.company_id = companies.id
    WHERE internships.status = 'active'
    ORDER BY internships.created_at DESC
  `
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(results)
  })
}

// Get one internship by ID
const getInternshipById = (req, res) => {
  const { id } = req.params
  const query = `
    SELECT 
      internships.*, 
      companies.company_name,
      (SELECT COUNT(*) FROM applications WHERE applications.internship_id = internships.id) AS applicants_count,
      (
        SELECT ROUND(IFNULL(
          SUM(CASE WHEN a2.status = 'accepted' THEN 1 ELSE 0 END) / COUNT(*) * 100,
          0
        ))
        FROM applications a2
        JOIN internships i2 ON a2.internship_id = i2.id
        WHERE i2.company_id = internships.company_id
      ) AS hire_rate
    FROM internships 
    JOIN companies ON internships.company_id = companies.id
    WHERE internships.id = ?
  `
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    if (results.length === 0) return res.status(404).json({ message: 'Internship not found' })
    res.json(results[0])
  })
}

// Create new internship
const createInternship = (req, res) => {
  const { company_id, title, description, location, duration, salary, employment_type, skills_required, difficulty, status } = req.body

  const query = `
    INSERT INTO internships 
    (company_id, title, description, location, duration, salary, employment_type, skills_required, difficulty, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  db.query(
    query,
    [company_id, title, description, location, duration, salary, employment_type, skills_required, difficulty || 'Medium', status || 'active'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error creating internship' })
      res.status(201).json({ message: 'Internship created successfully!', id: result.insertId })
    }
  )
}

// Delete internship
const deleteInternship = (req, res) => {
  const { id } = req.params
  db.query('DELETE FROM internships WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting internship' })
    res.json({ message: 'Internship deleted successfully!' })
  })
}
const VALID_INTERNSHIP_STATUSES = ['active', 'draft', 'closed']

// Close (or reopen) an offer — e.g. once the position has been filled
const updateInternshipStatus = (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!VALID_INTERNSHIP_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${VALID_INTERNSHIP_STATUSES.join(', ')}`,
    })
  }

  db.query(
    'UPDATE internships SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Internship not found' })
      }
      res.json({ message: 'Status updated successfully!', status })
    }
  )
}

// Get internships by company
const getCompanyInternships = (req, res) => {
  const { company_id } = req.params

  const query = `
    SELECT internships.*, 
    (SELECT COUNT(*) FROM applications WHERE applications.internship_id = internships.id) AS applicants_count
    FROM internships 
    WHERE internships.company_id = ?
    ORDER BY internships.created_at DESC
  `

  db.query(query, [company_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(results)
  })
}

// Get all applications for a company
const getCompanyApplications = (req, res) => {
  const { company_id } = req.params

  const query = `
    SELECT 
      applications.*,
      users.full_name,
      users.email,
      student_profiles.skills,
      student_profiles.university,
      student_profiles.bio,
      student_profiles.location,
      student_profiles.cv_url,
      internships.title as internship_title
    FROM applications
    JOIN student_profiles ON applications.student_id = student_profiles.id
    JOIN users ON student_profiles.user_id = users.id
    JOIN internships ON applications.internship_id = internships.id
    WHERE internships.company_id = ?
    ORDER BY applications.applied_at DESC
  `

  db.query(query, [company_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(results)
  })
}

// Get all applications for one specific internship
const getInternshipApplications = (req, res) => {
  const { id } = req.params

  const query = `
    SELECT 
      applications.*,
      users.full_name,
      users.email,
      student_profiles.skills,
      student_profiles.university,
      student_profiles.bio,
      student_profiles.location,
      student_profiles.cv_url
    FROM applications
    JOIN student_profiles ON applications.student_id = student_profiles.id
    JOIN users ON student_profiles.user_id = users.id
    WHERE applications.internship_id = ?
    ORDER BY applications.applied_at DESC
  `

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(results)
  })
}

module.exports = { 
  getAllInternships, 
  getInternshipById, 
  createInternship, 
  deleteInternship,
  getCompanyInternships,
  getCompanyApplications,
  getInternshipApplications,
  updateInternshipStatus
}