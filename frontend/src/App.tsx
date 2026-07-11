import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Landing } from './views/Landing'
import { Auth } from './views/Auth'
import { Lobby } from './views/Lobby'
import { DraftRoom } from './views/DraftRoom'
import { Leaderboard } from './views/Leaderboard'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomId" element={<DraftRoom />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
