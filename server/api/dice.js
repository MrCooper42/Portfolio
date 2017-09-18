'use strict';

const diceRegex = /^(\d+)(?:d(\d*)(?:([kdx])(\d+))?)?$/;
const dieRegex = /^(d)(\d+)$/
const operatorRegex = / *([-+]) */g;

const randInt = max => Math.ceil(Math.random() * max);

const dieRoll = (expression) => {
    let type = determineType(expression);
    if (type.type === null) {
        return null;
    }
    switch (type.type) {
        case "single":
            return diceRoll(expression, type);
        case "literal":
            let val = {
                'die': [null],
                'total': parseInt(expression, type)
            }
            return val;
        case "lowest":
            return dropLow(expression, type);
        case "highest":
            return keepHigh(expression, type);
        case "explosive":
            return explosiveRoll(expression, type);
        default:
            return null;
    }
}

const determineType = (toRoll) => {
    if (diceRegex.exec(toRoll) === null) {
        return null;
    }
    let [initRoll, N, sides, type, num, ...rest] = diceRegex.exec(toRoll);
    let roll = {
        N: parseInt(N),
        sides: parseInt(sides),
        type: type,
        num: parseInt(num)
    };
    if (sides === undefined) {
        roll.type = "literal";
        return roll;
    } else if (type === undefined) {
        roll.type = "single";
        return roll;
    } else if (type == "d" && num <= N) {
        roll.type = "lowest";
        return roll;
    } else if (type == "k" && num <= N) {
        roll.type = "highest";
        return roll;
    } else if (type == "x" && num <= sides) {
        roll.type = "explosive";
        return roll;
    } else {
        return "I do not recognize your nonsense!";
    }
}

const diceRoll = (toRoll, rol) => {
    let arr = [];

    for (let i = 0; i < rol.N; i++) {
        arr.push(randInt(rol.sides));
    }
    let val = {
        'die': arr,
        'total': arr.reduce((a, b) => a + b)
    }
    return val;
}

const dropLow = (toRoll, rol) => {
    let arr = [],
        total;
    for (let i = 0; i < rol.N; i++) {
        arr.push(randInt(rol.sides));
    }
    if (rol.num >= rol.N) {
        total = "0"
    } else {
        total = arr.sort().slice((rol.num), arr.length).reduce((a, b) => a + b)
    }
    let val = {
        'die': arr,
        'total': total
    }
    return val;
}

const keepHigh = (toRoll, rol) => {
    let arr = [],
        total,
        die;
    for (let i = 0; i < rol.N; i++) {
        arr.push(randInt(rol.sides));
    }
    if (rol.num >= rol.N) {
        total = arr.reduce((a, b) => a + b);
        die = arr.sort((a, b) => b - a);
    } else {
        total = arr.sort((a, b) => b - a).splice(0, rol.num).reduce((a, b) => a + b);
        die = arr.concat(total).sort((a, b) => b - a);
    }
    let val = {
        'die': arr,
        'total': total
    }
    return val;
}

const explosiveRoll = (toRoll, rol) => {
    let arr = [];
    if (rol.num == 1) {
        return Infinity;
    }
    for (let i = 0; i < rol.N; i++) {
        let currRoll = randInt(rol.sides);
        if (currRoll >= rol.num) {
            i--;
        }
        arr.push(currRoll);
    }
    let val = {
        'die': arr,
        'total': arr.reduce((a, b) => a + b)
    }
    return val;
}

const evaluate = (userInput) => {
    let vals = [];
    let uiArr = userInput
        .split(operatorRegex)
        .map((input) => (dieRegex.exec(input) !== null) ? input = `1${input}` : input)
        // .filter((check) => (diceRegex.exec(check) !== null) ? true : (operatorRegex.test(check)) ? true : false);

    if (uiArr.length % 2 == 0) {
        uiArr.pop();
    }
    if (!uiArr.length) {
        // console.log("fail here")
        return null;
    }

    let str = uiArr
        .map((element) => {
            if (diceRegex.exec(element) !== null) {
                let temp = dieRoll(element)
                vals.push(temp)
                return element = temp.total
            } else {
                return element
            }
        }).join('');

    let answer = eval(str);
    let data = {
        'values': vals,
        'answer': answer
    };
    return data;
}

const check = (input, max, min) => {
    let loose = [];
    let working = [];
    for (let i = 0; i < 100000; i++) {

        let answer = evaluate(input).answer

        if (answer <= max && answer >= min) {
            working.push(answer)
        } else {
            loose.push(answer);
        }

    }
    console.log(loose, "loose");
    console.log(working.length, "working");
}

const probability = (input) => {
    let prob = {};
    for (let i = 0; i < 50000; i++) {
        let answer = evaluate(input).answer

        if (prob.hasOwnProperty(answer)) {
            prob[answer] += 1;
        } else {
            prob[answer] = 1;
        }

    }
    for (var roll in prob) {
        if (prob.hasOwnProperty(roll)) {
            prob[roll] = ((prob[roll] / 50000) * 100).toFixed(4);
        }
    }
    return prob
}

// let single = "3d6";
// let lowest = "5d6d2";
// let highest = "5d6k2";
// let explosive = "4d6x5";
// let literal = "200";
// let fail = "xxxxxxxxx";
// let input = `${explosive} + ${literal}`;
// let input2 = `${input} - ${single} + ${literal}`
// console.log(eval(`${literal}+${literal}`), "lit")
// console.log(evaluate('3d6+211'), "input");
// console.log(evaluate(input), "input");
// console.log(evaluate(input2), "input 2");
// console.log(evaluate('d6'), "single");
// console.log(evaluate(literal), "literal");
// console.log(evaluate(single), "multi");
// console.log(evaluate(lowest), "lowest");
// console.log(evaluate(highest), "highest");
// console.log(evaluate(explosive), "explosive");
// console.log(evaluate(fail), "fail");
// check('5d6d3', 12, 2)
// probability('3d6')


module.exports = {
    determineType: determineType,
    evaluate: evaluate,
    keepHigh: keepHigh,
    dropLow: dropLow,
    diceRoll: diceRoll,
    probability: probability
}