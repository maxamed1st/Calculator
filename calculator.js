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

//Screen object
const screen = {
    allClear : function() {
        currentValue.textContent = "";
        accumulatorScreen.textContent = "";
    },
    clear : function() {currentValue.textContent = "";},
};
allClear.onmouseup = screen.allClear;
clear.onmouseup = screen.clear;
