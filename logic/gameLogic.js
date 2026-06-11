import {START_VALUE, TARGETS, DECIMAL_PLACES, generateCard, generateHand} from "../data/cards.js";

// data for each player
export const PLAYERS = [
    {name: "You", emoji: "🧑", cls: "you"},
    {name: "Delta", emoji: "🤖", cls: "ai1"},
    {name: "Epsilon", emoji: "🤖", cls: "ai2"},
    {name: "Zeta", emoji: "🤖", cls: "ai3"},
]

export function replaceCard(hand, playerIdx, cardIdx, round){
    const newHands = hand.map(h => [...h]);
    newHands[playerIdx][cardIdx] = generateCard(round);
    return newHands;
}

export function checkExactWin(vals, target) {
    return vals.findIndex(v => v === target);
}

export function getFinalRankings(vals, target) {
    return vals.map((v,i) => ({playerIdx: i, value: v, distance: Math.abs(v-target)})).sort((a,b) => a.distance - b.distance);
}

export function createInitialState(numAI, totalRounds, cardsPerTurn = 1) {
    const numPlayers = numAI + 1;
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const player = PLAYERS.slice(0, numPlayers);
    const hands = Array.from({ length: numPlayers }, () => generateHand(1));
    const maxCardsPerTurn = hands[0].length;
    return {
        numPlayers,
        totalRounds,
        cardsPerTurn: Math.max(1, Math.min(cardsPerTurn, maxCardsPerTurn)),
        target,
        round: 1,
        turnIndex: 0,
        phase: "player-plan",
        queuedPlays: [],
        vals: Array(numPlayers).fill(START_VALUE),
        hands,
        names: player.map(p => p.name),
        emojis: player.map(p => p.emoji),
        cls: player.map(p => p.cls),
        log: "Your turn - drag cards onto player profiles, then press Ready.",
        earlyWinner: null,
        playedCard: null,
        decimalPlaces: DECIMAL_PLACES
    };
}

// builds a list of plays: {cardIdx, targetPlayerIdx} from player's perspective
// returns {steps, finalVals, finalTarget, finalDecimalPlaces, newHands, summary}
export function buildSteps(plays, hands, vals, target, decimalPlaces, round, playerIdx, isAi){
    let runVals = [...vals];
    let runTarget = target;
    let runDP = decimalPlaces;
    let nextHands = hands;
    const steps = [];
    const summary = [];

    plays.forEach((play, i) => {
        const card = hands[playerIdx][play.cardIdx];
        nextHands = replaceCard(nextHands, playerIdx, play.cardIdx, round);
        
        if (card.type === "precision") {
            runDP = Math.max(0, runDP + card.dpDelta);
            steps.push({label: card.label, type: "precision", isAi, dpDelta: card.dpDelta, newDP: runDP});
            summary.push(`${i+1} ${card.label}: precision now ${runDP} decimal places.`);
        } 
        
        else if (card.type === "target") {
            const newTarget = card.fn(runTarget, runDP);
            runTarget = newTarget;
            steps.push({label: card.label, type: "target", isAi, newTarget});
            summary.push(`${i+1} ${card.label} on target: ${target} → ${newTarget}`);
        } 
        
        else if (card.type === "all") {
            const targets = runVals.map((v,idx) => {
                const newVal = card.fn(v, runDP);
                return {targetIdx: idx, newVal};
            });
            targets.forEach(({targetIdx, newVal}) => {runVals[targetIdx] = newVal;});
            steps.push({label: card.label, type: "all", isAi, targets});
            summary.push(`${i+1} ${card.label} on all: ${targets.map(t => t.newVal).join(", ")}`);
        } 
        
        else if (card.type === "single") {
            const targetIdx = play.targetPlayerIdx;
            const oldVal = runVals[targetIdx];
            const newVal = card.fn(oldVal, runDP);
            runVals[targetIdx] = newVal;
            steps.push({label: card.label, type: "single", isAi, targets: [{targetIdx: targetIdx, newVal: newVal}]});
            summary.push(`${i+1} ${card.label} on ${targetIdx}: ${oldVal} → ${newVal}`);
        }
    });
    return {steps, finalVals: runVals, finalTarget: runTarget, finalDecimalPlaces: runDP, newHands: nextHands, summary};

}
