// greedy function that makes the AI choose the best local move
export function aiChooseMove(aiIdx, hands, vals, target, excludedCardIdxs = new Set()){
    const aiHand = hands[aiIdx];
    const aiVal = vals[aiIdx];
    const unavailable = excludedCardIdxs instanceof Set ? excludedCardIdxs : new Set(excludedCardIdxs);
    let bestScore = -Infinity;
    let bestMove = { cardIdx: 0, targetPlayerIdx: aiIdx};

    // compares each card's score with itself and other people
    aiHand.forEach((card, cardIdx) => {
        if (unavailable.has(cardIdx)) return;

        if (card.type === "target") {
            const newTarget = card.fn(target);
            
            // check if other players will reach target after move; if so, stop considering this
            if (vals.includes(newTarget) && aiVal !== newTarget) {return;}

            // checks improvement and assigns score
            const selfScore = Math.abs(newTarget - aiVal) - Math.abs(target - aiVal);
            if (selfScore > bestScore) {bestScore = selfScore; bestMove = {cardIdx: cardIdx, targetPlayerIdx: -1};}
            return;
        }

        if (card.type === "all") {
            const newVal = card.fn(aiVal);
            for (const [idx, v] of vals.entries()) {
                if (idx === aiIdx) {continue};
                if (target === card.fn(v)) {return;}
            }
            const selfScore = Math.abs(target - newVal) - Math.abs(target - aiVal);
            if (selfScore > bestScore) {bestScore = selfScore; bestMove = {cardIdx: cardIdx, targetPlayerIdx: -1};}
            return;
        }

        if (card.type === "single") { 
            const newVal = card.fn(aiVal)
            const selfScore = Math.abs(target - newVal) - Math.abs(target - aiVal);

            if (selfScore > bestScore) {bestScore = selfScore; bestMove = {cardIdx: cardIdx, targetPlayerIdx: aiIdx};}
            vals.forEach((val, playerIdx) => {
                if (playerIdx === aiIdx) return;

                // get higher score for pushing opponents away from target
                const closestDist = Infinity;
                const dist = Math.abs(target - val);
                const opponentScore = dist - Math.abs(target - card.fn(val));

                // prioritize opponents closer to target
                if (opponentScore >= bestScore && dist < closestDist) {bestScore = opponentScore; bestMove = {cardIdx: cardIdx, targetPlayerIdx: playerIdx};}
            })
        }
    });
    // return the best move for the AI
    return bestMove;
}
