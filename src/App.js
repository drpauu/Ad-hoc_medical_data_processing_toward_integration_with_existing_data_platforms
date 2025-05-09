// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header       from './components/Header';
import Footer       from './components/Footer';
import Home         from './pages/Home';
import TestList     from './pages/TestList';
import TestDetails  from './pages/testDetails2';
import DoctorsList  from './pages/DoctorsList';
import DoctorTests  from './pages/DoctorTests';

import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <div className="content">
        <Routes>
          {/* — páginas generales — */}
          <Route path="/"            element={<Home />} />
          <Route path="/test-list"   element={<TestList />} />

          {/* — doctores — */}
          <Route path="/doctors-list"            element={<DoctorsList />} />
          <Route path="/doctors/:did"            element={<DoctorTests />} />
          <Route path="/doctors/:did/test/:id"   element={<TestDetails />} />

          {/* ruta absoluta por si se llega desde otros lugares */}
          <Route path="/test/:id"    element={<TestDetails />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
