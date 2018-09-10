const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;
const math = require('mathjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

app.use(express.static(`${__dirname}/public`));

//Mongoose for the DB
let mongoURI = '';
if (process.env.MONGODB_URI != undefined) {
  mongoURI = process.env.MONGODB_URI;
} else {
  mongoURI = 'mongodb://localhost:27017/calculator';
}
mongoose.connect(mongoURI, { useNewUrlParser: true });
mongoose.connection.on('connected', () => console.log('mongoose is connected'))
let calcSchema = new Schema({ calc: String });
let Calc = mongoose.model('Calculation', calcSchema, 'calculations');

//The Goodstuf
let calcHistory = [];
let calculation = '';

io.on('connection', (socket) => {
  console.log('a new client has connected', calcHistory);
  console.log(socket.id);

  socket.emit('newClientConnected', calcHistory);
  socket.on('calculationTime', (data) => {
    console.log('calculation socket id', socket.id);
    calculateTotal(data, socket.id);
  })
  getCalcs();
})

function calculateTotal(data, socketId) {
  calculation = data.join('');
  let mathTotal = math.eval(calculation);
  calculation = calculation + '=' + mathTotal;
  // calcHistory.unshift(calculation);
  // calcHistory = [...calcHistory.slice(0, 10)];
  io.to(socketId).emit('calculationDone', mathTotal);
  io.emit('updateHistory', calcHistory);
  saveCalc(calculation);
}

function saveCalc(calculation) {
  let calcToSave = new Calc({ calc: calculation });
  calcToSave.save((err, data) => {
    if (err) {
      console.log('Save Error');
    }
    else {
      console.log('item saved')
      getCalcs();
    }
  })
}

function getCalcs() {
  Calc.find({}, null, { sort: { _id: -1 } }, (err, calculations) => {
    if (err) {
      console.log('Error Getting Calcs')
    }
    else {
      console.log(calculations);
      calcHistory = [];
      calculations.forEach((calc) => {
        calcHistory.push(calc.calc);
      })
      calcHistory = [...calcHistory.slice(0, 10)];
      io.emit('updateHistory', calcHistory);
    }
  })
}

server.listen(PORT);
console.log(`Listening on port ${PORT}`);