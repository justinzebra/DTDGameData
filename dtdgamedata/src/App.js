// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Lobby from './Lobby';
import AddMatch from './AddMatch';
import AddPlayer from './AddPlayer';
import './App.css';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">大廳</Link>
        <Link to="/add-match">新增比賽</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/add-match" element={<AddMatch />} />
        <Route path="/add-player" element={<AddPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;
