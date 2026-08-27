import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterForm from './pages/RegisterForm'
import StudentDashboard from './pages/StudentDashboard'
import Explorer from './pages/Explorer'
import InternshipDetails from './pages/InternshipDetails'
import StudentProfile from './pages/StudentProfile'
import CompanyDashboard from './pages/CompanyDashboard'
import NewOffer from './pages/NewOffer'
import Applications from './pages/Applications'
import OfferDetails from './pages/OfferDetails'
import CompanyOffers from './pages/CompanyOffers'
import CompanyApplicants from './pages/CompanyApplicants'
import CompanySettings from './pages/CompanySettings'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:role" element={<RegisterForm />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/explorer" element={<Explorer />} />
          <Route path="/student/internship/:id" element={<InternshipDetails />} />
          <Route path="/student/settings" element={<StudentProfile />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/new-offer" element={<NewOffer />} />
          <Route path="/company/offers" element={<CompanyOffers />} />
          <Route path="/company/offer/:id" element={<OfferDetails />} />
          <Route path="/company/applicants" element={<CompanyApplicants />} />
          <Route path="/company/settings" element={<CompanySettings />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App