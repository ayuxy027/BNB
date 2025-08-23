import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WaitlistPage from './pages/WaitlistPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import CreatePage from './pages/CreatePage'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WaitlistPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/create" element={<CreatePage />} />
            </Routes>
        </Router>
    )
}

export default App
