const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;

app.use(express.static(`${__dirname}/public`));

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
})

function calculateTotal(data, socketId) {
  console.log('socketId', socketId);
  calculation = data.join('');
  let maths;
  let mathTotal;
  let total;
  let mathArray = data; 

  let arrayToCalculate = mathArray;
  maths = arrayToCalculate.join();

  //while loop for math functions
  while (arrayToCalculate.length > 1) {
    let a = parseFloat(arrayToCalculate.shift()); //changes value to number
    let b = arrayToCalculate.shift();
    let c = parseFloat(arrayToCalculate.shift()); //changes value to number

    total = 0;
    switch (b) { // parses out the math function and completes it
      case '+':
        total = a + c;
        break;
      case '-':
        total = a - c;
        break;
      case '*':
        total = a * c;
        break;
      case '/':
        total = a / c;
        break;
      default:
        console.log('this is not valid');
    }
    arrayToCalculate.unshift('' + total); //puts the totalled number back on the front
  }
  mathTotal = total;
  calculation = calculation + '=' + mathTotal.toString();
  calcHistory.unshift(calculation);
  calcHistory = [...calcHistory.slice(0, 10)];
  io.to(socketId).emit('calculationDone', mathTotal);
  io.emit('updateHistory', calcHistory);
}

server.listen(PORT);
console.log(`Listening on port ${PORT}`);