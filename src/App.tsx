import { Navigate, Route, Routes } from 'react-router-dom'
import { Game } from './pages/Game'
import { Home } from './pages/Home'
import { SettingsPage } from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
