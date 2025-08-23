import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WaitlistPage from './pages/WaitlistPage'
// import DashboardPage from './pages/DashboardPage'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WaitlistPage />} />
                {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
            </Routes>
        </Router>
    )
}

export default App
