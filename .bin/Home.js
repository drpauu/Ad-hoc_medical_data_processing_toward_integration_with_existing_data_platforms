import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestList from './TestList';
import TestDetails from './TestDetails';
import EditPage from './EditPage';

const Home = () => {
  return (
    <Router>
      <div>
        <h1>Aplicación de Tests</h1>
        <Routes>
          <Route path="/" element={<TestList />} />
          <Route path="/test/:id" element={<TestDetails />} />
          <Route path="/edit/:id" element={<EditPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default Home;

