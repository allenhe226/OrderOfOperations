import {useState, useEffect, useCallback} from "react";

const CARD_COUNT = 3;
const CARD_MIN = 1;
const CARD_MAX = 12;

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createRandomCards(count, min, max) {
    const operations = [
        amount => ({label: `+${amount}`, fn: v => v + amount}),
        amount => ({label: `-${amount}`, fn: v => v - amount}),
        amount => ({label: `*${amount}`, fn: v => v * amount}),
        amount => ({label: `/${amount}`, fn: v => Math.round(v / amount)})
    ];

    const selectedOperations = shuffle(operations).slice(0, Math.min(count, operations.length));

    return selectedOperations.map(makeCard => {
        const amount = randomInt(min, max);
        return makeCard(amount);
    });
}

const CARD_DECK = createRandomCards(CARD_COUNT, CARD_MIN, CARD_MAX);
// const CARD_DECK = [{label: "+3", fn: v => v+3}, {label: "+5", fn:v => v+5}]

const INIT_VALUE = 10;
const TARGET_VALUE = [50,100,200,250,500]
const HAND_SIZE = 4;

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
    return shuffle([...CARD_DECK])
}

export function drawCards(deck, count) {
    const drawn = deck.slice(0, count);
    const remaining = deck.slice(count);
    return {drawn, remaining};
}