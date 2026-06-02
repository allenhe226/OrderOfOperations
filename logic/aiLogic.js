// function that scores how good a move is depending on the old and new values
function score(newVal, oldVal, target) {
    const oldScore = Math.abs(oldVal - target);
    const newScore = Math.abs(newVal - target);
    return oldScore - newScore;
}

// greedy function that makes the AI choose the best local move
export function aiChooseMove(hand, aiVal, playerVal, target){
    // set best score as low as possible, and best move to a random arbritary move
    let bestScore = -Infinity
    let bestMove = {cardIndex: 0, applyTo: "self"};
    hand.forEach((card, i) => {
        // for each card, check how much closer the AI can be to the target
        const newAiVal = card.fn(aiVal);
        const selfScore = score(newAiVal, aiVal, target);
        if (selfScore > bestScore){
            bestScore = selfScore;
            bestMove = {cardIndex: i, applyTo: "self"};
        }

        // for each card, check how much farther the player can be to the target
        const newPlayerVal = card.fn(playerVal);
        const otherScore = -score(newPlayerVal, playerVal, target);
        if (otherScore > bestScore){
            bestScore = otherScore;
            bestMove = {cardIndex: i, applyTo: "player"};
        }
    });
    // return the best move out of all these options
    return bestMove;
}