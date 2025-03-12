// server.js
require('dotenv').config(); // Carga las variables del archivo .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas usando la variable de entorno
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a MongoDB Atlas establecida...'))
  .catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Definición del esquema y modelo para la colección "tests"
const testSchema = new mongoose.Schema({
  test: {
    pid: String,
    did: String,
    tid: String,
    pulsid: String,
    date: Date,
    o2: Number,
    weight: Number,
    height: Number,
    age: Number,
    cone_distance: Number
  },
  initial: {
    spo: Number,
    hr: Number,
    d: Number,
    f: Number
  },
  final: {
    meters: Number,
    d: Number,
    f: Number,
    pascon_count: Number,
    half_rest_spo: Number,
    half_rest_hr: Number,
    end_rest_spo: Number,
    end_rest_hr: Number,
    comment: String
  },
  pascon: [{
    n: Number,
    t: Number,
    s: Number,
    h: Number
  }],
  stops: [{
    time: Number,
    len: Number
  }],
  data: [{
    p: Number,
    t: Number,
    s: Number,
    h: Number
  }]
});

const Test = mongoose.model('Test', testSchema);

// Endpoints de la API

// Obtener todos los tests
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find({});
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener los detalles de un test por su ID
app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test no encontrado' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar un test (por ejemplo, para editarlo)
app.put('/api/tests/:id', async (req, res) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTest) return res.status(404).json({ error: 'Test no encontrado' });
    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Puedes agregar endpoints adicionales (por ejemplo, para cálculos, descargas en Excel/PDF, etc.)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
