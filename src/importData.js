const mongoose = require('mongoose');
const uri = 'mongodb+srv://pau:1234@adhocmedicaldataprocess.o15gv.mongodb.net/database?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a Mongo Atlas'))
  .catch(err => console.error('Error de conexión', err));

// Esquema que coincide con la estructura de tu JSON
const dataSchema = new mongoose.Schema({
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
    cone_distance: Number,
  },
  initial: {
    spo: Number,
    hr: Number,
    d: Number,
    f: Number,
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
    comment: String,
  },
  pascon: [{
    n: Number,
    t: Number,
    s: Number,
    h: Number,
  }],
  stops: [{
    time: Number,
    len: Number,
  }],
  data: [{
    p: Number,
    t: Number,
    s: Number,
    h: Number,
  }]
});

const DataModel = mongoose.model('Data', dataSchema);

// Importa el JSON
const jsonData = require('./database.json');

// Inserta el documento
DataModel.create(jsonData)
  .then(() => {
    console.log('Documento guardado con la estructura del JSON');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
