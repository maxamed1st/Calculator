const accumulatorScreen = document.getElementById("accumulatorScreen");
const currentValue = document.getElementById("currentValue");
const numbers = document.querySelectorAll(".number");
const dot = document.getElementById("dot");
const equal = document.getElementById("equal");
const operators = document.querySelectorAll(".operator");
const multiplication = document.getElementById("multiplication");
const division = document.getElementById("division");
const addition = document.getElementById("addition");
const subtraction = document.getElementById("subtraction");
const clear = document.getElementById("clear");
const allClear = document.getElementById("allClear");

//Screen object to view and accumulate inputs to the calculator
const screen = {
    array : [],
    index : 0,
    reset : false,
    updateArray : element => {
        screen.array[screen.index] = element;
        screen.index++;
    },
    allClear : function() {
        screen.array = [];
        currentValue.textContent = "";
        accumulatorScreen.textContent = "";
        operator.temp = null;
        operator.currentMinus = false;
    },
    clear : () => currentValue.textContent = "",
    setCurrentValue : value => currentValue.textContent = value,
    extendCurrentValue : value => currentValue.textContent += `${value}`,
    accumulate : value => accumulatorScreen.textContent += `${value}`,
    getCurrentValue : () => currentValue.textContent.trim(),
    getAllValues : () => accumulatorScreen.textContent
};
//Operator object performs the basic arithmetic operations and produces result
const operator = {
    values : [],
    index : 0,
    skipCurrent : null,
    prevIndex : -1,
    operationPrecedence : true,
    lastOperation : false,
    temp : null,
    currentMinus : false,
    zeroDivision : false,
    multiplication : (num1, num2) => {
        return num1*num2;
    },
    division : (num1, num2) => {
        return num1/num2;
    },
    addition : (num1, num2) => {
        return num1+num2;
    },
    subtraction : (num1, num2) => {
        return num1-num2;
    },
    numbersEvent : (e) => {
        if (screen.reset) {
            screen.setCurrentValue("");
            screen.reset = false;
        }
        if (operator.currentMinus) {
            screen.setCurrentValue("-");
            operator.currentMinus = false;
        }
        if (e.key) screen.extendCurrentValue(e.key);
        else screen.extendCurrentValue(e.target.textContent);
    },
    dotEvent : () => {
        //If there is no dot in currentValue then add one
        screenCurrentValue = screen.getCurrentValue();
        if (screen.reset || screenCurrentValue == "") {
            if (screen.reset) screen.reset = false;
            screen.setCurrentValue("0.");
        } else {
            if (screenCurrentValue.split("").indexOf(".") > -1) return;
            else screen.extendCurrentValue(".");
        }
    },
    nonCalculable : (reason = "No operand") => {
        //Display why operation is nonCalculable
        screen.reset = true;
        if (reason === "No operation") {
            return screen.setCurrentValue('Can\'t calculate without operator and operands');
        }
        else if (reason === "Adjacent operators") {
            operator.currentMinus = true;
            return screen.setCurrentValue("Two operators in a row not allowed");
        }
        else if(reason === "Same reason") {
            return screen.setCurrentValue("Two operators in a row are still not allowed");
        }
        else if (reason === "Text") {
            return screen.setCurrentValue("Can't operate on my own error message");
        } else {
            return screen.setCurrentValue("You cant operate without operands");
        }
    },
    zeroDivisionTrue : () => {
        operator.zeroDivision = false;
        screen.reset = true;
        screen.setCurrentValue("I can't divide by zero")
    },
    operation : (e) => {
        let screenCurrentValue = screen.getCurrentValue();
        let result;
        let currentOperator;
        //Check if operation is called by keyboar or mouseclick
        if(e.key) currentOperator = e.key;
        else currentOperator = e.target.textContent;
        //Validate that minus is the only operation that can be added at start
        if (screenCurrentValue === "") {
            if (currentOperator === "-") screen.setCurrentValue(currentOperator);
            else {
                return operator.nonCalculable();
            }
        } else {
            if (screenCurrentValue.startsWith("Y") || screenCurrentValue.startsWith("C")) {         
                return operator.nonCalculable();
            }
            //Check if operation is being done on text or there is adjacent operators;
            else if(screenCurrentValue.startsWith("T")) return operator.nonCalculable("Same reason");
            else if (screenCurrentValue === "-") return operator.nonCalculable("Adjacent operators");
            else if (screenCurrentValue.startsWith("I")) return operator.nonCalculable("Text");
            else {
                if (operator.temp) {
                    //If last value on screen is an operator. Add it to array
                    screen.updateArray(operator.temp);
                };
                //Add current value to the accumulater and array
                screen.accumulate(screenCurrentValue);
                screen.updateArray(screenCurrentValue);
                screen.accumulate(currentOperator);
                operator.temp = currentOperator;   
                if (screen.array.length > 2) {
                    //If there is enought values on screen, calculate and display result
                    screen.reset = true;
                    result = operator.calculate();
                    if (operator.zeroDivision) operator.zeroDivisionTrue();
                    else screen.setCurrentValue(result);
                } else {
                    //If there is only one value. clear it!
                    screen.setCurrentValue("")
                }
            }
        }
    },
    reducerExtension : (prev, current, index, array, operation, nextValue) => {
        let result;
        if ((!operator.operationPrecedence) && (typeof (array[array.length-1]) === "number")) {
            operator.values = [];
        }
        if (operation === operator.division && nextValue === "0") {
            operator.zeroDivision = true;
            return null;
        }
        if (operation) {
            result = operation(+prev, +nextValue);
            operator.skipCurrent = index + 1;
            if (operator.lastOperation===true) {
                if (typeof prev === "number") operator.values.pop();
                operator.values.push(result);
            }
            return result;
        }
        return current;
    },
    setValues : (prev, current, index, array, nextValue) => {
        let nexOperation = array[index + 2];
        if ((nexOperation === "*" || nexOperation === "/")) {
            operator.lastOperation = true;
            if (+operator.prevIndex === index - 1) {
                operator.values.splice(operator.index, 0, current);
                operator.index += 1;       
            } else {
                operator.values.splice(operator.index, 0, prev, current);
                operator.index += 2;
            }
        } else {
            if(operator.lastOperation) operator.lastOperation = false;
            if ((+operator.prevIndex === index - 1)) {
                operator.values.splice(operator.index, 0, current, nextValue);
                operator.index += 2;
                }
             else {
                operator.values.splice(operator.index, 0,prev, current, nextValue);
                operator.index += 3;
            }
        }
        operator.prevIndex = index + 1;
        return nextValue;
    },
    reducerCallback : (prev, current, index, array) => {
        if (operator.skipCurrent === index) return prev;
        let nexOperation = array[index + 2];
        let nextValue = array[index + 1];
        if (!nextValue) nextValue = 1;
        let operation;
        if (operator.operationPrecedence) {
            (current === "*") ? operation = operator.multiplication : 
            (current === "/") ? operation = operator.division :
            operation = null;
            if (current === "+" || current === "-") {
                if (operator.values.length > 0) {
                    lastNum = operator.values[operator.values.length-1];
                } else lastNum = "";
                if (typeof lastNum === "number" && operator.values.length > 0) {
                    operator.prevIndex = index - 1;
                }
                return operator.setValues(prev, current, index, array, nextValue);
            }
        } else {
            (current === "+") ? operation = operator.addition:
            (current === "-") ? operation = operator.subtraction:
            operation = null;
        }
        let result = operator.reducerExtension(prev, current, index, array,operation, nextValue);
        return result;
    },
    calculate : () => {
        let allValues = screen.array;
        let currentValue = screen.getCurrentValue();
        let total;
        //Add latest value and operator to array
        if (currentValue.length > 0 && !screen.reset) {
            if(operator.temp){
                allValues.push(operator.temp, currentValue)
                screen.accumulate(operator.temp);
                screen.accumulate(currentValue)
            } else {
                allValues.push(currentValue);
                screen.accumulate(currentValue);
            }
        }
        if (allValues.length === 0) {
            return operator.nonCalculable("No operation");
        }
        //Evaluate multiplication first
        total = allValues.reduce(operator.reducerCallback);
        if (operator.values.length > 0) {
            //Evaluate addition
            operator.operationPrecedence = false;
            total = operator.values.reduce(operator.reducerCallback);
            operator.operationPrecedence = true;
            operator.values = [];
        }
        return total;
    },
    equality : () => {
        /*Calculate terms and clear accumulatorScreen*/
        let total = operator.calculate();
        screen.allClear();
        if (operator.zeroDivision) operator.zeroDivisionTrue();
        else screen.setCurrentValue(total);
        screen.reset = true;
    }
}
const keyEvent = (e) => {
    let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    if (numbers.indexOf(e.key) !== -1) operator.numbersEvent(e);
    else if (e.key === ".") operator.dotEvent();
    else if (e.key === "*" || e.key === "/" || e.key === "+" || e.key === "-") operator.operation(e);
    else if (e.key === "=" || e.key === "Enter" || e.key === " " || e.key === "Spacebar") operator.equality();
    else if (e.key === "Backspace") screen.clear();
    else if (e.key === "Escape") screen.allClear();
}
const main = () => {
    allClear.onmouseup = screen.allClear;
    clear.onmouseup = screen.clear;
    equal.onmouseup = operator.equality;
    numbers.forEach(num => num.onmouseup = operator.numbersEvent);
    dot.onmouseup = operator.dotEvent;
    operators.forEach(element => element.onmouseup = operator.operation);
    document.onkeydown = keyEvent;
}
main();
