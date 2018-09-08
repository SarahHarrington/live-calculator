console.log('JS loaded');
const socket = io();

const numBtns = [...document.querySelectorAll('.num-btn')];
const mathBtns = [...document.querySelectorAll('.math-btn')];
const clearBtn = document.querySelector('#clear');
const backBtn = document.querySelector('#back');
const display = document.querySelector('#display');
const equalBtn = document.querySelector('.equals');
const history = document.querySelector('.history');
let calculation = [""];

numBtns.forEach((btn) => {
  btn.addEventListener('click', number);
})

mathBtns.forEach((btn) => {
  btn.addEventListener('click', operator)
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
  console.log(e)
  let number = e.target.id;
  console.log(calculation);
  calculation[calculation.length-1] += number;
  updateDisplay();
}

function operator(e) {
  calculation.push(e.target.id);
  calculation.push("");
  updateDisplay();
}

function calculateTheString() {
  console.log('clicked the equals button');
  socket.emit('calculationTime', calculation);
  calculation = [''];
}

function updateDisplay() {
  display.innerHTML = calculation.join('');
}

function clearCalculator() {
  display.innerHTML = '';
  calculation = [''];
}

function backButton() {
  var calcString = calculation.pop();
  var sbString = calcString.slice(0, calcString.length-1);
  calculation.push(sbString);
  updateDisplay();
}

equalBtn.addEventListener('click', calculateTheString)
clearBtn.addEventListener('click', clearCalculator);
backBtn.addEventListener('click', backButton);