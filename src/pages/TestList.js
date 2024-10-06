import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import data from '../json/database.json';  // Importamos el JSON directamente

const TestList = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    if (data && data.test) {
      // Verificamos si `test` es un array o un objeto
      if (Array.isArray(data.test)) {
        setTests(data.test);
      } else {
        // Si no es un array, lo convertimos en un array con un solo elemento
        setTests([data.test]);
      }
    }
  }, []);

  if (tests.length === 0) {
    return <p>No tests available.</p>;
  }

  return (
    <div>
      <h1>List of Tests</h1>
      <ul>
        {tests.map((test, index) => (
          <li key={index}>
            {/* Mostramos el ID del test */}
            <Link to={`/test/${test.tid}`}>
              Test {index + 1}: ID {test.tid}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestList;
