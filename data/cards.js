export const START_VALUE = 10;
export const TARGETS = [25, 50, 64, 75, 100, 120, 150, 200];
export const HAND_SIZE = 7;
export const DECK_SIZE = 40;
export const DECIMAL_PLACES = 0;

// function that gives the relative probability for each operation
const OPS = ["add", "add", "add", "add", "add", "sub", "sub", "sub", "mul", "mul", "div", "exp", "root", "decimal"];
const TYPES = ["single", "single", "single", "single", "single", "single", "single", "all", "all", "target"];

// function for generating random cards
export function generateCard(round) {

    // value that scales with the square root of the round, allowing cards in later rounds to be more likely larger
    const power = Math.sqrt(round);
    const op = OPS[Math.floor(Math.random() * OPS.length)];
    let type = TYPES[Math.floor(Math.random() * TYPES.length)];
    
    // cases for all four operations (addition, subtraction, multiplication, division)
    if (op === "add") {
        const amount = randomInt(1, Math.round(1 + power * 3));
        return {type: type, label: `+${amount}`, fn: (v, dp) => roundTo(v + amount, dp)};
    }
    if (op === "sub") {
        const amount = randomInt(1, Math.round(1 + power * 3));
        return {type: type, label: `-${amount}`, fn: (v, dp) => roundTo(v - amount, dp)};
    }
    if (op === "mul") {
        const factor = randomInt(2, Math.max(2, Math.round(1 + power * 0.5)));
        return {type: type, label: `×${factor}`, fn: (v, dp) => roundTo(v * factor, dp)};
    }
    if (op === "div") {
        const factor = randomInt(2, Math.max(2, Math.round(1 + power * 0.5)));
        return {type: type, label: `/${factor}`, fn: (v, dp) => roundTo(v / factor, dp)};
    }
    if (op === "exp") {
        const exponent = randomInt(2, Math.max(2, Math.round(2 + power * 0.2)));
        return {type: type, label: `^${exponent}`, fn: (v, dp) => roundTo(v**exponent, dp)};
    }
    if (op === "root") {
        const exponent = randomInt(2, Math.max(2, Math.round(2 + power * 0.2)));
        return {type: type, label: `${exponent}√`, fn: (v, dp) => roundTo(v**(1.0/exponent), dp)};
    }
    if (op === "decimal") {
        type = "precision";
        const amount = randomInt(1, 3);
        if (Math.floor(Math.random() * 2) === 0) {
            return {type: type, label: `${amount} decimals right`, fn: null, dpDelta: +amount};
        } else {
            return {type: type, label: `${amount} decimals left`, fn: null, dpDelta: -amount}
        }
    }
}

// creates a hand using these randomly generated cards
export function generateHand(round = 1, size = HAND_SIZE) {
    return Array.from({length: size}, () => generateCard(round));
}

// helper function for generating a random number within an interval (inclusive)
function randomInt(min, max) {
    if (max <= min) return min;
    return min + Math.floor(Math.random() * (max-min+1));
}

function roundTo(number, decimalPlaces) {
    const dp = Math.max(0, decimalPlaces);
    return Math.round(number * (10 ** dp)) / (10 ** dp);
}