const accumulatorScreen = document.getElementById("accumulatorScreen");
const currentValue = document.getElementById("currentValue");
const numbers = document.getElementsByClassName("number");
const dot = document.getElementById("dot");
const equal = document.getElementById("equal");
const multiplication = document.getElementById("multiplication");
const division = document.getElementById("divistion");
const addition = document.getElementById("addition");
const subtraction = document.getElementById("subtraction");
const clear = document.getElementById("clear");
const allClear = document.getElementById("allClear");

//Screen object to view and accumulate inputs to the calculator
const screen = {
    allClear : function() {
        currentValue.textContent = "";
        accumulatorScreen.textContent = "";
    },
    clear : () => currentValue.textContent = "",
    updateCurrent : value => currentValue.textContent = value,
    accumulate : value => accumulatorScreen.textContent += `${value} `
};
//Operator object performs the basic arithmetic operations and produces result
const operator = {
    multiplication : (num1, num2) => {
        return num1*num2;
    },
    division : (num1, num2) => {
        return num1/num2;
    },
    addition : (num1, num2) => {
        return num1*num2;
    },
    subtraction : (num1, num2) => {
        return num1*num2;
    }
}
allClear.onmouseup = screen.allClear;
clear.onmouseup = screen.clear;
