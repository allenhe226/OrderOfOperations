// root component for all files

import React from "react";
import {useState, useEffect, useCallback} from "react";
import {createInitialState, replaceCard, checkWinner} from "./logic/gameLogic.js";
import {aiChooseMove} from "./logic/aiLogic.js";
import {S, COLORS} from "./styles/styles.js";
import {CardTile, ProgressBar, PlayedCardDisplay, GameOverModal} from "./components/components.jsx";

// used for gloabl keyframe animations
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap');

  /* Card deals in from slightly below with a fade */
  @keyframes dealIn {
    from { opacity: 0; transform: translateY(16px) rotate(2deg); }
    to   { opacity: 1; transform: translateY(0)    rotate(0deg); }
  }

  /* Card flies onto the table from below with a spring bounce */
  @keyframes cardPlay {
    from { opacity: 0; transform: scale(0.6) translateY(40px) rotate(-8deg); }
    to   { opacity: 1; transform: scale(1)   translateY(0)    rotate(0deg);  }
  }

  /* Overlay fades in */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Modal bounces up */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }

  /* Score number pulses when it changes */
  @keyframes pulse {
    0%   { transform: scale(1);    }
    40%  { transform: scale(1.18); }
    100% { transform: scale(1);    }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0d0d; }
`;


export default function Main() {
    // creating the game in one immutable object
    const [gs, setGs] = useState(() => createInitialState());
    const [pulsing, setPulsing] = useState({playerVal: false, aiVal: false});
    function triggerPulse(keys) {
        setPulsing(p => {const next = {...p}; keys.forEach(k => next[k] = true); return next;});
        setTimeout(() => setPulsing({playerVal: false, aiVal: false}), 500);
    }

    // show card on table briefly
    function showPlayedCard(cardInfo, callback) {
        setGs(prev => ({...prev, playedCard: cardInfo}));
        setTimeout(() => {callback(); setTimeout(() => setGs(prev => ({...prev, playedCard:null})),150);}, 600);
    }

    // player clicks a card
    function handleSelectCard(index) {
        if (gs.phase !== "select") return;
        setGs(prev => ({...prev, selectedCardIndex: index, phase: "target", log: `"${prev.hand[index].label}" selected: play it on yourself or the AI?`,}));
    }

    // player chooses to apply card on self or opponent
    function handleApplyCard(applyTo) {
        if (gs.phase !== "target" || gs.selectedCardIndex === null) return;
        const card = gs.hand[gs.selectedCardIndex];
        let newPlayerVal = gs.playerVal;
        let newAiVal = gs.aiVal;
        let logMsg;
        if (applyTo === "self") {
            newPlayerVal = card.fn(gs.playerVal);
            logMsg = `You played "${card.label}" on yourself: ${gs.playerVal} → ${newPlayerVal}`;
        } else {
            newAiVal = card.fn(gs.aiVal);
            logMsg = `You played "${card.label}" on the AI: ${gs.aiVal} → ${newAiVal}`
        }
        const {newHand, newDeck} = replaceCard(gs.hand, gs.deck, gs.selectedCardIndex);
        const winner = checkWinner(newPlayerVal, newAiVal, gs.target);
        const pulsedKeys = applyTo === "self" ? ["playerVal"] : ["aiVal"];
        showPlayedCard({label: card.label, target:applyTo}, () => {
            triggerPulse(pulsedKeys);
            setGs(prev => ({
                ...prev,
                playerVal: newPlayerVal,
                aiVal: newAiVal,
                hand: newHand,
                deck: newDeck,
                selectedCardIndex: null,
                phase: winner ? "game-over" : "ai-thinking",
                winner,
                log: winner ? logMsg : logMsg + " - AI is thinking...",
            }));
        });
    }

    // AI takes its turn, with a slight delay to simulate thinking
    useEffect(() => {
        if (gs.phase !== "ai-thinking") return;
        const timer = setTimeout(() => {
            const move = aiChooseMove(gs.hand, gs.aiVal, gs.playerVal, gs.target);
            const card = gs.hand[move.cardIndex];
            let newPlayerVal = gs.playerVal;
            let newAiVal = gs.aiVal;
            let logMsg;
            if (move.applyTo === "self") {
              newAiVal = card.fn(gs.aiVal);
              logMsg = `AI played "${card.label}" on itself: ${gs.aiVal} -> ${newAiVal}`;
            } else {
                newPlayerVal = card.fn(gs.playerVal);
              logMsg = `AI played "${card.label}" on you: ${gs.playerVal} -> ${newPlayerVal}`;
            }
            const {newHand, newDeck} = replaceCard(gs.hand, gs.deck, move.cardIndex);
            const winner = checkWinner(newPlayerVal, newAiVal, gs.target);
            const pulsedKeys = move.applyTo === "self" ? ["aiVal"] : ["playerVal"];
            
            // shows the AI's card on the table
            showPlayedCard(
                {label: card.label, target: move.applyTo === "self" ? "ai-self" : "ai-player"},
                () => {
                    triggerPulse(pulsedKeys);
                    setGs(prev => ({
                        ...prev,
                        playerVal: newPlayerVal,
                        aiVal: newAiVal,
                        hand: newHand,
                        deck: newDeck,
                        round: prev.round + 1,
                        phase: winner ? "game-over" : "select",
                        winner,
                        log: logMsg,
                    }));
                }
            )
        }, 900);
        // clear the timer if the component rerenders
        return () => clearTimeout(timer);
    }, [gs.phase]);
    const handleRestart = useCallback(() => setGs(createInitialState()), []);
    const isPlayerTurn  = gs.phase === "select" || gs.phase === "target";
    const cardsDisabled = !isPlayerTurn;
    return (
        <>
          {/* Inject global keyframes and font import once */}
          <style>{GLOBAL_CSS}</style>
    
          <div style={S.root}>
    
            {/* ── Header ── */}
            <header style={S.header}>
              <h1 style={S.title}>Order of Operations</h1>
              <p style={S.subtitle}>Math Card Game</p>
            </header>
    
            {/* ── Score board: You | Target | AI ── */}
            <div style={S.scoreboard}>
              {/* Player score */}
              <div style={{ ...S.scoreBox, ...S.scoreBoxYou }}>
                <div style={S.scoreName}>You</div>
                <div
                  style={{
                    ...S.scoreNum,
                    ...S.scoreNumYou,
                    animation: pulsing.playerVal ? "pulse 0.45s ease" : "none",
                  }}
                >
                  {gs.playerVal}
                </div>
              </div>
    
              {/* Center target + round counter */}
              <div style={S.targetBox}>
                <div style={S.targetLabel}>Target</div>
                <div style={S.targetNum}>{gs.target}</div>
                <div style={S.roundLabel}>Round {gs.round}</div>
              </div>
    
              {/* AI score */}
              <div style={{ ...S.scoreBox, ...S.scoreBoxAi }}>
                <div style={S.scoreName}>AI</div>
                <div
                  style={{
                    ...S.scoreNum,
                    ...S.scoreNumAi,
                    animation: pulsing.aiVal ? "pulse 0.45s ease" : "none",
                  }}
                >
                  {gs.aiVal}
                </div>
              </div>
            </div>
    
            {/* ── Progress bars ── */}
            <div style={S.progressRow}>
              <ProgressBar value={gs.playerVal} target={gs.target} color={COLORS.gold} label="Your progress" />
              <ProgressBar value={gs.aiVal}     target={gs.target} color={COLORS.red}  label="AI progress"   />
            </div>
    
            {/* ── Center table: card play animation zone ── */}
            <PlayedCardDisplay playedCard={gs.playedCard} />
    
            {/* ── Action log ── */}
            <div style={S.log} aria-live="polite">{gs.log}</div>
    
            {/* ── Player's hand ── */}
            <div>
              <div style={S.handLabel}>Your hand</div>
              <div style={S.hand}>
                {gs.hand.map((card, i) => (
                  <CardTile
                    key={`${card.label}-${i}`}
                    card={card}
                    index={i}
                    isSelected={gs.selectedCardIndex === i}
                    isDisabled={cardsDisabled}
                    animDelay={i * 60}          // stagger the deal-in animation
                    onSelect={handleSelectCard}
                  />
                ))}
              </div>
            </div>
    
            {/* ── Target selector: only shown after a card is selected ── */}
            {gs.phase === "target" && (
              <div style={S.targetSection}>
                <div style={S.handLabel}>Apply to…</div>
                <div style={S.targetRow}>
                  <button style={{ ...S.targetBtn, ...S.targetBtnSelf }} onClick={() => handleApplyCard("self")}>
                    ▲ Yourself
                  </button>
                  <button style={{ ...S.targetBtn, ...S.targetBtnOpp }} onClick={() => handleApplyCard("opp")}>
                    ▼ AI Opponent
                  </button>
                </div>
                <div style={S.hint}>
                  Careful — some operations help you more than they hurt the AI.
                </div>
              </div>
            )}
    
            {/* ── Game over overlay ── */}
            {gs.phase === "game-over" && (
              <GameOverModal
                winner={gs.winner}
                target={gs.target}
                round={gs.round}
                onRestart={handleRestart}
              />
            )}
    
          </div>
        </>
    );
}

