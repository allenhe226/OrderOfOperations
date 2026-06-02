import { START_VAL, TARGETS, HAND_SIZE, DECK_SIZE, generateCard } from "../data/cards.js";

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

export function buildDeck() {
    return shuffle(Array.from({ length: DECK_SIZE }, () => generateCard(1)));
}

export function drawCards(deck, count) {
    const drawn = deck.slice(0, count);
    const remaining = deck.slice(count);
    return {drawn, remaining};
}

export function replaceCard(hand, deck, cardIndex){
    const activeDeck = deck.length === 0 ? buildDeck() : deck;
    const { drawn: [newCard], remaining} = drawCards(activeDeck, 1)
    const newHand = [...hand];
    newHand.splice(cardIndex, 1, newCard);
    return {newHand, newDeck : remaining};
}

export function checkWinner(playerVal, aiVal, target) {
    const playerWin = playerVal === target;
    const aiWin = aiVal === target;
    if (playerWin && aiWin) return "draw";
    if (playerWin) return "player";
    if (aiWin) return "ai";
    return null;
}

export function createInitialState() {
    const deck = buildDeck();
    const {drawn : hand, remaining} = drawCards(deck, HAND_SIZE);
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    return {
        deck: remaining,
        hand, 
        playerVal: START_VAL,
        aiVal: START_VAL,
        target,
        round: 1,
        selectedCardIndex: null,
        phase: "select",
        winner: null,
        log: "Pick a card from your hand, then choose where to play it.",
        playedCard: null,
    };
}