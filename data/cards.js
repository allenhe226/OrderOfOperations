export const START_VAL = 10;
export const TARGETS = [25, 50, 64, 75, 100, 120, 150, 200];
export const HAND_SIZE = 4;

// function that gives the relative probability for each operation
const OPS = ["add", "add", "add", "sub", "sub", "sub", "mul", "div"];

// function for generating random cards
export function generateCard(round) {

    // value that scales with the square root of the round, allowing cards in later rounds to be more likely larger
    const power = Math.sqrt(round);
    const op = OPS[Math.floor(Math.random() * OPS.length)];
    
    // cases for all four operations (addition, subtraction, multiplication, division)
    if (op === "add") {
        const amount = randomInt(1, Math.round(1 + power * 3));
        return {label: `+${amount}`, fn: v => v + amount};
    }
    if (op === "sub") {
        const amount = randomInt(1, Math.round(1 + power * 3));
        return {label: `-${amount}`, fn: v => v - amount};
    }
    if (op === "mul") {
        const factor = randomInt(2, Math.max(2, Math.round(1 + power * 0.5)));
        return {label: `×${amount}`, fn: v => v * amount};
    }
    if (op === "div") {
        const factor = randomInt(2, Math.max(2, Math.round(1 + power * 0.5)));
        return {label: `/${amount}`, fn: v => Math.round(v / amount)};
    }
}

// creates a hand using these randomly generated cards
export function generateHand(round) {
    return Array.from({length: HAND_SIZE}, () => generateCard(round))
}

// helper function for generating a random number within an interval (inclusive)
function randomInt(min, max) {
    if (max <= min) return min;
    return min + Math.floor(Math.random() * (max-min+1))
}