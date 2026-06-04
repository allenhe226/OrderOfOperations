// function that scores how good a move is depending on the old and new values
function score(newVal, oldVal, target) {
    const oldScore = Math.abs(oldVal - target);
    const newScore = Math.abs(newVal - target);
    return oldScore - newScore;
}

// greedy function that makes the AI choose the best local move
export function aiChooseMove(aiIdx, hands, vals, target){
    const hand = hands[aiIdx];
    const myVal = vals[aiIdx];
    let best = -Infinity, bestCard = 0, bestTarget = aiIdx, closestDist = Infinity;

    // compares each card's score with itself and other people
    hand.forEach((card, ci) => {
        const selfScore = score(card.fn(myVal), myVal, target);
        if (selfScore > best) {
            best = selfScore;
            bestCard = ci;
            bestTarget = aiIdx;
        }
        vals.forEach((v, pi) => {
            if (pi === aiIdx) return;
            const oppScore = -score(card.fn(v), v, target);
            const curDist = Math.abs(v - target);
            if (oppScore > best && curDist < closestDist) {
                best = oppScore;
                bestCard = ci;
                bestTarget = pi;
                closestDist = curDist;
            }
        })
    });
    // return the best move for the AI
    return {cardIdx: bestCard, targetPlayerIdx: bestTarget};
}