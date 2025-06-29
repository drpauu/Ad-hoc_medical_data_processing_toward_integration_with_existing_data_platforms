import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header       from './components/Header';
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

          <Route path="/"            element={<Home />} />
          <Route path="/test-list"   element={<TestList />} />

          <Route path="/doctors-list"            element={<DoctorsList />} />
          <Route path="/doctors/:did"            element={<DoctorTests />} />
          <Route path="/doctors/:did/test/:id"   element={<TestDetails />} />

          <Route path="/test/:id"    element={<TestDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
