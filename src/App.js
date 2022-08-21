import React from 'react'
import './App.css'
import TypingTestPage from './TypingTestPage/'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TypingTestPage />} />
      </Routes>
    </Router>

  )
}

export default App