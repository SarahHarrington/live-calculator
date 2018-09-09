console.log('JS loaded');
const socket = io();

const numBtns = [...document.querySelectorAll('.num-btn')];
const clearBtn = document.querySelector('#clear');
const backBtn = document.querySelector('#back');
const display = document.querySelector('#display');
const equalBtn = document.querySelector('.equals');
const history = document.querySelector('.history');
let calculation = [];

numBtns.forEach((btn) => {
  btn.addEventListener('click', number);
})

socket.on('newClientConnected', (calcHistory) => {
  console.log('a new client has connected', calcHistory);
  calcHistory.forEach(calc => {
    let indCalc = document.createElement('p');
    indCalc.innerHTML = calc;
    history.appendChild(indCalc);
  })
})

socket.on('calculationDone', (data) => {
  display.innerHTML = `${data}`
})

socket.on('updateHistory', (calcHistory) => {
  history.innerHTML = '';
  calcHistory.forEach(calc => {
    let indCalc = document.createElement('p');
    indCalc.innerHTML = calc;
    history.appendChild(indCalc);
  })
})

function number(e) {
  let btn = e.target.id;
  calculation.push(btn);
  console.log(calculation);
  updateDisplay();
}

function calculateTheString() {
  let a = calculation[calculation.length -1];
  console.log(calculation[calculation.length -1]);
  if (a === '/' || a === '*' || a === '-' || a === '+') {
    return;
  }
  else {
    socket.emit('calculationTime', calculation);
    calculation = [];
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

equalBtn.addEventListener('click', calculateTheString)
clearBtn.addEventListener('click', clearCalculator);
backBtn.addEventListener('click', backButton);