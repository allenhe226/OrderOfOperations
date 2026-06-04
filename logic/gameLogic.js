import { START_VALUE, TARGETS, generateCard, generateHand } from "../data/cards.js";

// data for each player
export const PLAYERS = [
    {name: "You", emoji: "🧑", cls: "you"},
    {name: "Delta", emoji: "🤖", cls: "ai1"},
    {name: "Epsilon", emoji: "🤖", cls: "ai2"},
    {name: "Zeta", emoji: "🤖", cls: "ai3"},
]

export function shuffle(arr) {
    const a = [...arr];
    for (let i = 1; i < a.length; i++){
        const j = Math.floor(Math.random() * (i+1));
        
        // switches a[i] and a[j]
        const temp = a[i]
        a[i] = a[j]
        a[j] = temp
    }
    return a;
}

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

export function createInitialState(numAI, totalRounds) {
    const numPlayers = numAI + 1;
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const player = PLAYERS.slice(0, numPlayers);
    return {
        numPlayers,
        totalRounds,
        target,
        round: 1,
        turnIndex: 0,
        phase: "player-select",
        selectedCardIdx: null,
        vals: Array(numPlayers).fill(START_VALUE),
        hands: Array.from({ length: numPlayers }, () => generateHand(1)),
        names: player.map(p => p.name),
        emojis: player.map(p => p.emoji),
        cls: player.map(p => p.cls),
        log: "Your turn - pick a card from your hand!",
        earlyWinner: null,
        playedCard: null,
    };
}