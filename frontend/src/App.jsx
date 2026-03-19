import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import SOIBPage from './pages/SOIBPage';
import VisualIDPage from './pages/VisualIDPage';
import SpeciesCatalog from './pages/SpeciesCatalog';
import SpeciesDetail from './pages/SpeciesDetail';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>

        {/* Main Application with Shared Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<SpeciesCatalog />} />
          <Route path="/catalog/:id" element={<SpeciesDetail />} />
          <Route path="/species-index" element={<SOIBPage />} />
          <Route path="/visual-id" element={<VisualIDPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/record" element={<HomePage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
