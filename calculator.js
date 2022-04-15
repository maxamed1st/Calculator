const accumulatorScreen = document.getElementById("accumulatorScreen");
const currentValue = document.getElementById("currentValue");
const numbers = document.querySelectorAll(".number");
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
    setCurrentValue : value => currentValue.textContent = value,
    extendCurrentValue : value => currentValue.textContent += `${value}`,
    accumulate : value => accumulatorScreen.textContent += `${value}`,
    getCurrentValue : () => currentValue.textContent,
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
        screen.extendCurrentValue(e.target.textContent);
    },
    reducerExtension : (prev, current, index, operation, nextValue) => {
        let result;
        if (operation) {
            result = operation(+prev, +nextValue);
            operator.skipCurrent = index + 1;
            if (operator.lastOperation===true) {
                operator.values.push(result);
                operator.lastOperation = false;
            }
            return result;
        }
        return current;
    },
    setValues : (prev, current, index, array, nextValue) => {
        let nexOperation = array[index + 2];
        if ((nexOperation === "*" || nexOperation === "/")) {
            if ((index + 2)===(array.length - 2)) {
                operator.lastOperation = true;
            }
            if (+operator.prevIndex === index - 1) {
                operator.values.splice(operator.index, 0, current);
                operator.index += 1;           
            } else {
                operator.values.splice(operator.index, 0, prev, current);
                operator.index += 2;
            }
        } else {
            if (+operator.prevIndex === index - 1) {
            operator.values.splice(operator.index, 0, current, nextValue);
            operator.index += 2;
            } else {
            operator.values.splice(operator.index, 0,prev, current, nextValue);
            operator.index += 3;
            }
        }
        operator.prevIndex = index + 1;
        return nextValue;
    },
    reducerCallback : (prev, current, index, array) => {
        if (operator.skipCurrent === index) return prev;
        let nextValue = array[index + 1];
        let operation;
        if (operator.operationPrecedence) {
            (current === "*") ? operation = operator.multiplication : 
            (current === "/") ? operation = operator.division :
            operation = null;
            if (current === "+" || current === "-") {
                return operator.setValues(prev, current, index, array, nextValue);
            }
        } else {
            (current === "+") ? operation = operator.addition:
            (current === "-") ? operation = operator.subtraction:
            operation = null;
        }
        let result = operator.reducerExtension(prev, current, index, operation, nextValue);
        return result;
    },
    equal : () => {
        let allValues = screen.getAllValues().trim().split('');
        let total;
        if (allValues.length === 0) {
            return screen.setCurrentValue('Can\'t calculate without operator and operands');
        }
        total = allValues.reduce(operator.reducerCallback);
        if (operator.values.length > 0) {
            operator.operationPrecedence = false;
            total = operator.values.reduce(operator.reducerCallback);
            operator.operationPrecedence = true;
        }
        screen.setCurrentValue(total);
    }
}
const main = () => {
    allClear.onmouseup = screen.allClear;
    clear.onmouseup = screen.clear;
    equal.onmouseup = operator.equal;
    numbers.forEach(num => num.onmouseup = operator.numbersEvent);
}
main()