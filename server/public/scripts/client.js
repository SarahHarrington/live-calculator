console.log('JS loaded');
// Socket
const socket = io();

// ============ Variables ============ 
const numBtns = [...document.querySelectorAll('.num-btn')];
const clearBtn = document.querySelector('#clear');
const backBtn = document.querySelector('#back');
const display = document.querySelector('#display');
const equalBtn = document.querySelector('.equals');
const history = document.querySelector('.history');
let calculation = [];

// ============ SOCKET EVENTS ============ 
// When a new client connects, takes calcHistory and displays
socket.on('newClientConnected', (calcHistory) => {
  console.log('a new client has connected');
  updateCalcHistory(calcHistory);
})

//After calculation is complete, updates display with calc result
socket.on('calculationDone', (data) => {
  display.innerHTML = `${data}`;
})

//After the calculation is done, updates the history display
socket.on('updateHistory', (calcHistory) => {
  history.innerHTML = '';
  updateCalcHistory(calcHistory);
})

// ============ FUNCTIONS ============ 
//collects the nubmers and operators and pushes them to array
function number(e) {
  let btn = e.target.id;
  calculation.push(btn);
  updateDisplay();
}

//calculates the string after checking to make sure string is valid
function calculateTheString() {
  if (calculation.length > 1) {
    let a = calculation[calculation.length - 1]; //last button pushed
    let b = calculation[0]; //first button pushed
    if ((a === '/' || a === '*' || a === '-' || a === '+') || (b === '/' || b === '*' || b === '+')) {
      return;
    }
    else {
      //if conditions are met, sent to server
      socket.emit('calculationTime', calculation);
      calculation = [];
    }
  }
}

function updateDisplay() {
  display.innerHTML = calculation.join('');
}

function clearCalculator() {
  display.innerHTML = '';
  calculation = [];
}

function backButton() {
  calculation.pop();
  updateDisplay();
}

//updates the calculation history on page load or new calc is done
function updateCalcHistory(calcHistory) {
  calcHistory.forEach(calc => {
    let indCalc = document.createElement('p');
    indCalc.innerHTML = calc;
    history.appendChild(indCalc);
  })
}

// ============ EVENT LISTENERS ============ 
numBtns.forEach((btn) => {
  btn.addEventListener('click', number);
})
equalBtn.addEventListener('click', calculateTheString)
clearBtn.addEventListener('click', clearCalculator);
backBtn.addEventListener('click', backButton);