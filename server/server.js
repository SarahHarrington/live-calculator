//requirements etc.
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;
const math = require('mathjs');

//express
app.use(express.static(`${__dirname}/public`));

//Mongoose for the DB
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

//The Good Stuff
let calcHistory = [];
let calculation = '';


// ==== SOCKET ====
io.on('connection', (socket) => {
  //WHEN NEW CLIENT CONNECTS, SENDS CALC HISTORY
  socket.emit('newClientConnected', calcHistory);

  //LISTENING FOR CALCULATION FROM CLIENT
  socket.on('calculationTime', (data) => {
    calculateTotal(data, socket.id);
  })

  getCalcs();
})

// ==== FUNCTIONS ====
function calculateTotal(data, socketId) {
  calculation = data.join('');
  let mathTotal = math.eval(calculation);
  calculation = calculation + '=' + mathTotal;

  //EMITS THE TOTAL BACK TO THE CLIENT THAT SENT THE REQUEST
  io.to(socketId).emit('calculationDone', mathTotal);

  //EMITS TO EVERYONE CONNECTED TO UDPATE HISTORY
  io.emit('updateHistory', calcHistory);

  //SAVES CALC TO DATABASE
  saveCalc(calculation);
}

//SAVES THE CALCULATION TO THE DATABASE
function saveCalc(calculation) {
  let calcToSave = new Calc({ calc: calculation });
  calcToSave.save((err, data) => {
    if (err) {
      console.log('Save Error');
    }
    else {
      getCalcs();
    }
  })
}

//GETS THE CALCULATIONS FROM THE MONGO
function getCalcs() {
  Calc.find({}, null, { sort: { _id: -1 } }, (err, calculations) => {
    if (err) {
      console.log('Error Getting Calcs')
    }
    else {
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