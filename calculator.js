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
        screen.extendCurrentValue(e.target.textContent);
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
        } else {
            return screen.setCurrentValue("You cant operate without operands");
        }
    },
    operation : (e) => {
        let currentOperator = e.target.textContent;
        let screenCurrentValue = screen.getCurrentValue();
        let result;
        if (screenCurrentValue === "") {
            if (currentOperator === "-") screen.setCurrentValue(currentOperator);
            else {
                return operator.nonCalculable();
            }
        } else {
            if (screenCurrentValue.startsWith("Y") || screenCurrentValue.startsWith("C")) {         
                return operator.nonCalculable();
            }
            else if(screenCurrentValue.startsWith("T")) return operator.nonCalculable("Same reason");
            else if (screenCurrentValue === "-") return operator.nonCalculable("Adjacent operators");
            else {
                if (operator.temp) {
                    screen.accumulate(operator.temp);
                    screen.updateArray(operator.temp);
                };
                screen.accumulate(screenCurrentValue);
                screen.updateArray(screenCurrentValue);
                operator.temp = currentOperator;   
                if (screen.array.length > 2) {
                    screen.reset = true;
                    result = operator.calculate();
                    screen.setCurrentValue(result);
                } else {
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
        screen.setCurrentValue(total);
        screen.reset = true;
    }
}
const main = () => {
    allClear.onmouseup = screen.allClear;
    clear.onmouseup = screen.clear;
    equal.onmouseup = operator.equality;
    numbers.forEach(num => num.onmouseup = operator.numbersEvent);
    operators.forEach(element => element.onmouseup = operator.operation);
}
main();
