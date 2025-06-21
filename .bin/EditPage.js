
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../src/services/api'; 

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [formData, setFormData] = useState({
    pid: '',
    date: ''
  });

  useEffect(() => {
    fetchData(`/api/tests/${id}`)
      .then(data => {
        setTest(data);
        setFormData({
          pid: data.test.pid,
          date: data.test.date ? new Date(data.test.date).toISOString().substring(0, 10) : ''
        });
      })
      .catch(error => console.error('Error al obtener el test:', error));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    fetch(`/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: { ...test.test, pid: formData.pid, date: formData.date }

      })
    })
      .then(response => response.json())
      .then(() => navigate(`/test/${id}`))
      .catch(error => console.error('Error al actualizar el test:', error));
  };

  if (!test) {
    return <div>Cargando test...</div>;
  }

  return (
    <div>
      <h2>Editar Test</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>PID:</label>
          <input type="text" name="pid" value={formData.pid} onChange={handleChange} />
        </div>
        <div>
          <label>Fecha:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>

        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditPage;
