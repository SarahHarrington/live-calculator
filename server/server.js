const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000;
const math = require('mathjs');

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
  let mathTotal = math.eval(calculation);
  console.log(mathTotal);

  calculation = calculation + '=' + mathTotal;
  calcHistory.unshift(calculation);
  calcHistory = [...calcHistory.slice(0, 10)];
  io.to(socketId).emit('calculationDone', mathTotal);
  io.emit('updateHistory', calcHistory);
}

server.listen(PORT);
console.log(`Listening on port ${PORT}`);