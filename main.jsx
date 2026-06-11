// root component for all files

import React from "react";
import {useState, useEffect, useRef} from "react";
import {createInitialState, replaceCard, checkExactWin, getFinalRankings, buildSteps} from "./logic/gameLogic.js";
import {aiChooseMove} from "./logic/aiLogic.js";
import {HAND_SIZE} from "./data/cards.js";
import {C} from "./styles/styles.js";

const AI_THINK_MS = 1500;
const CARD_POP_MS = 420;        // card springs up at center
const CARD_HOLD_MS = 80;         // brief pause at full size
const CARD_FLY_MS = 480;         // flight to target
const CARD_FADE_MS = 400;          // fade out time for
const CARD_LAND_PAUSE_MS = 180;  // pause after landing before next card
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// function for determining a player's cartesian coordinates in a circle
// positions for seat elements at two radii
function seatPosition(playerIdx, total, r = 50) {
    const angle = (Math.PI / 2) + (2 * Math.PI / total) * playerIdx;
    return {x: 50+r*Math.cos(angle), y: 50+r*Math.sin(angle), angle};
}

// used for global keyframe animations
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
  @keyframes dealIn  { from{opacity:0;transform:translateY(14px) rotate(3deg)} to{opacity:1;transform:none} }
  @keyframes cardPlay {
    from { opacity:0; transform:scale(0.6) rotate(-8deg);}
    to   { opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes flyToSeat {
    from { opacity:1; transform:translate(0,0) scale(1) rotate(0deg); }
    to   { opacity:0; transform:translate(var(--dx), var(--dy)) scale(0.86) rotate(0deg); }
  }
  @keyframes fadeOut {
    from {opacity:1;}
    to {opacity:0;}
    }
  @keyframes pulse   { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 100%{transform:scale(1)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes glow    { 0%,100%{box-shadow:0 0 6px ${C.glowGoldLow}} 50%{box-shadow:0 0 18px ${C.glowGoldHigh}} }
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    background:${C.bg};
    background-image:
      repeating-linear-gradient(93deg,transparent,transparent 38px,rgba(255,255,255,0.014) 38px,rgba(255,255,255,0.014) 39px),
      repeating-linear-gradient(177deg,transparent,transparent 68px,rgba(0,0,0,0.06) 68px,rgba(0,0,0,0.06) 69px);
  }
`;

// card visual helpers
function cardTypeColors(type) {
  return C.typeColors[type] ?? C.typeColors.single;
}

function CardPip({ label, type, isAi, phase, dx, dy }) {
  const tc = cardTypeColors(type);
  function getAnim() {
    if (phase === "pop")  return `cardPlay ${CARD_POP_MS}ms cubic-bezier(.34,1.56,.64,1) both`;
    if (phase === "fly")  return `flyToSeat ${CARD_FLY_MS}ms cubic-bezier(.22,.61,.36,1) both`;
    if (phase === "fade") return `fadeOut ${CARD_FADE_MS}ms cubic-bezier(.22,.61,.36,1) both`;
    return "none";
  }
  const badgeColor = type === "all" ? "#7a2fd4" : type === "target" ? "#1a8fd4" : C.gold;
  return (
    <div style={{ width: 58, height: 84, borderRadius: 8, background: tc.bg,
      border: `2px solid ${isAi ? C.red : tc.border}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.65)",
      position: "relative", animation: getAnim(), "--dx": dx, "--dy": dy }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: tc.suit,
        fontFamily: "'DM Mono',monospace", lineHeight: 1, textAlign: "center" }}>{label}</div>
      <div style={{ fontSize: 9, color: badgeColor, fontWeight: 700, marginTop: 3,
        background: `${badgeColor}22`, borderRadius: 99, padding: "1px 5px", letterSpacing: ".05em" }}>
        {type}
      </div>
    </div>
  );
}

// setup screen
function SetupScreen({onStart}){
    const [numAI, setNumAI] = useState(1);
    const [rounds, setRounds] = useState(8);
    const [cardsPerTurn, setCardsPerTurn] = useState(2);
    const [customRounds, setCustom] = useState(12);
    const [useCustom, setUseCustom] = useState(false);
    const finalRounds = useCustom ? customRounds : rounds;
    const chip = (val, current, onClick, label) => (
        <button key={val} onClick = {onClick} style = {{
            padding: '7px 15px', 
            border: `1px solid ${current === val ? C.gold : C.border}`,
            borderRadius: 20,
            background: current === val ? C.goldDim : C.bg,
            color: current === val ? C.gold : C.textMuted,
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            cursor: "pointer", 
            transition: "all .20s",
        }}> {label ?? val} </button>
    );

    return (
        <div style={{maxWidth:480,margin:'0 auto',padding:'2rem 1.25rem',animation:'fadeIn .4s ease'}}>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:26,textAlign:'center',marginBottom:4,color:C.gold,letterSpacing:'.06em'}}>Order of Operations</h1>
        <p style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:C.textMuted,textAlign:'center',marginBottom:'1.75rem'}}>Math Card Game</p>

        {/* Card type legend */}
        <div style = {{background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem", marginBottom: "1rem"}}>
            <div style = {{fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: C.textMuted, marginBottom: 10}}>Card Types</div>
            {[
                {type: "single", label: "🏹 Single", color: C.typeColors.single.border, desc: "Apply to one player"},
                {type: "all", label: "⚡ All", color: C.typeColors.all.border, desc: "Applies to all players"},
                {type: "target", label: "🎯 Target", color: C.typeColors.target.border, desc: "Apply to the target number"},
            ].map(r => (
                <div key = {r.type} style = {{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
                    <span style = {{fontSize: 11, padding: "2px 8px", borderRadius: 99, background: `${r.color}22`,
                    border: `1px solid ${r.color}`, color: r.color, fontfamily: "'DM Mono', monospace", minWidth: 64, textAlign: "center"}}>{r.label}</span>
                </div>
            ))}
        </div>

        {/* AI count selector */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1.1rem',marginBottom:'1rem'}}>
            <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:C.textMuted,marginBottom:10}}>AI Opponents</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[1,2,3].map(n => chip(n, numAI, ()=>setNumAI(n)))}
            </div>
        </div>

        {/* rounds selector */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1.1rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:C.textMuted,marginBottom:10}}>Number of Rounds</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[5,8,10,15].map(n => chip(useCustom?-1:n, rounds, ()=>{setRounds(n);setUseCustom(false)}))}
            <button onClick={()=>setUseCustom(true)} style={{
                padding:'7px 16px', border:`1px solid ${useCustom?C.gold:C.border}`,
                borderRadius:20, background:useCustom?C.goldDim:C.bg,
                color:useCustom?C.gold:C.textMuted, fontFamily:"'DM Mono',monospace",
                fontSize:13,cursor:'pointer',transition:'all .15s'
            }}>Custom</button>
            </div>
            {useCustom && (
            <input type="number" min={3} max={50} value={customRounds}
                onChange={e=>setCustom(Math.max(3,parseInt(e.target.value)||3))}
                style={{marginTop:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
                padding:'8px 12px',color:C.text,fontSize:14,fontFamily:"'DM Mono',monospace",width:90,textAlign:'center'}}
            />
            )}
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:'1.1rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:C.textMuted,marginBottom:10}}>Cards Per Turn</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {Array.from({ length: HAND_SIZE }, (_, i) => i + 1).map(n => chip(n, cardsPerTurn, ()=>setCardsPerTurn(n)))}
            </div>
        </div>

        <button onClick={()=>onStart(numAI, finalRounds, cardsPerTurn)} style={{
            width:'100%',padding:14,background:C.gold,color:C.bg,border:'none',
            borderRadius:10,fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:700,
            letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer'
        }}>Enter The Game</button>
        </div>
    );
}

// game screen
export default function Main() {
    // creating the game in one immutable object
    const [screen, setScreen] = useState('setup'); // 'setup' | 'game' | 'end'
    const [gs, setGs] = useState(null);
    const [pulsing, setPulse] = useState({}); // { playerIdx: true } briefly after value changes
    const [targetPulsing, setTargetPulse] = useState(false);
    // activeCard: {type, label, isAi, dx, dy} — the single card currently flying, or null
    const [activeCard, setActiveCard] = useState(null);
    // liveVals: shown on seats during resolution, updated card-by-card
    const [liveVals, setLiveVals] = useState(null);
    const [liveTarget, setLiveTarget] = useState(null);
    const [liveDP, setLiveDP] = useState(null);
    const timerRef = useRef(null);

    function triggerPulse(idx) {
        setPulse(p => ({ ...p, [idx]: true }));
        setTimeout(() => setPulse(p => ({...p, [idx]: false})), 500);
    }

    function triggerTargetPulse() {
        setTargetPulse(true)
        setTimeout(() => setTargetPulse(false), 600);
    }

    // Play a sequence of {type, label, isAi, phase targets: [{targetIdx, newVal}] | "target"} one at a time.
    // After the last card, call onDone().
    async function playSequence(steps, playerCount, initialVals, initialTarget, initialDP, onDone) {
        let currentVals = [...initialVals];
        let currentTarget = initialTarget;
        let currentDP = initialDP;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            // determine card
            const isTargetCard = step.type === "target";
            const isAllCard = step.type === "all";
            const isPrecisionCard = step.type === "precision";

            // determine fly target position for animation
            let dx = "0%", dy = "0%";
            if (!isTargetCard && !isAllCard && !isPrecisionCard) {
                const pos = seatPosition(step.targets[0].targetIdx, playerCount);
                dx = `${(pos.x - 50) * 9}%`;
                dy = `${(pos.y - 50) * 9}%`;
            }

            // pop card into center
            setActiveCard({label: step.label, type: step.type, isAi: step.isAi, dx, dy, phase: "pop"});
            await sleep(CARD_POP_MS + CARD_HOLD_MS);

            // fly or fade animation
            const flyPhase = (isTargetCard || isAllCard || isPrecisionCard) ? "fade" : "fly";
            const flyDur = (isTargetCard || isAllCard || isPrecisionCard) ? CARD_FADE_MS : CARD_FLY_MS;
            setActiveCard(prev => prev ? {...prev, phase: flyPhase} : null);
            await sleep(flyDur);

            if (isPrecisionCard) {
                currentDP = step.newDP;
                setLiveDP(currentDP);
            } else if (isTargetCard) {
                currentTarget = step.newTarget;
                setLiveTarget(currentTarget);
                triggerTargetPulse();
            } else {
                step.targets.forEach(({targetIdx, newVal}) => {
                    currentVals[targetIdx] = newVal;
                    triggerPulse(targetIdx);
                });
                setLiveVals([...currentVals]);
            }
            await sleep(CARD_LAND_PAUSE_MS);
        }

        // reset all states
        setActiveCard(null);
        setLiveVals(null);
        setLiveTarget(null);
        setLiveDP(null);
        onDone(currentVals, currentTarget, currentDP);
    }

    function resolveAfterMove(newVals, newTarget, newDP, newHands, logMsg, nextFn) {
        const exactIdx = checkExactWin(newVals, newTarget);
        if (exactIdx !== -1) {
          setGs(prev => ({ ...prev, vals: newVals, hands: newHands, target: newTarget, decimalPlaces: newDP,
            log: logMsg + ` — ${exactIdx === 0 ? "You hit" : prev.names[exactIdx] + " hit"} the target exactly!`,
            phase: "game-over", earlyWinner: exactIdx}));
          setTimeout(() => setScreen("end"), 600);
          return true;
        }
        nextFn(newVals, newTarget, newDP, newHands, logMsg);
        return false;
    }

    function advanceTurn(vals, target, dp, hands, log) {
        setGs(prev => {
            const nextTurn = (prev.turnIndex + 1) % prev.numPlayers;
            const newRound = nextTurn === 0 ? prev.round + 1 : prev.round;
            if (newRound > prev.totalRounds && nextTurn === 0) {
                setTimeout(() => setScreen("end"), 400);
                return {...prev, vals, hands, target, decimalPlaces: dp, log, phase:'game-over', round: newRound};
            }

        const phase = nextTurn === 0 ? "player-plan" : "ai-turn";
        return {...prev, vals, hands, target, decimalPlaces: dp, log: nextTurn === 0 ? log + " — Your turn!" : log, 
            turnIndex: nextTurn, round: newRound, phase, queuedPlays: []};
        });
    }

    // handles the behaviour when player is dragging cards during their turn
    function handleQueuePlay(cardIdx, targetIdx) {
        if (!gs || gs.phase !== "player-plan") return;
        setGs(prev => {
            if (prev.phase !== "player-plan") return prev;
            if (prev.queuedPlays.length >= prev.cardsPerTurn) return prev;
            if (prev.queuedPlays.some(p => p.cardIdx === cardIdx)) return prev;

            const card = prev.hands[0][cardIdx];
            const effectiveTarget = (card.type === "all" || card.type === "target") ? -1 : targetIdx;
            const who = effectiveTarget === -1 ? (card.type === "target" ? "target" : "all") : (effectiveTarget === 0 ? "yourself" : prev.names[effectiveTarget]);
            const nextQueue = [...prev.queuedPlays, {cardIdx: cardIdx, targetPlayerIdx: effectiveTarget }];
            return {...prev, queuedPlays: nextQueue, log: `Queued ${nextQueue.length}/${prev.cardsPerTurn}: "${card.label}" -> ${who}`};
        });
    }

    function handleUnqueuePlay(queueIdx) {
        if (!gs || gs.phase !== "player-plan") return;
        setGs(prev => {
            const nextQueue = prev.queuedPlays.filter((_, i) => i !== queueIdx);
            return {...prev, queuedPlays: nextQueue, log: nextQueue === 0 ? "Queue cleared." : `Queue updated (${nextQueue.length}/${prev.cardsPerTurn}).`};
        });
    }

    function handleClearQueue() {
        if (!gs || gs.phase !== "player-plan") return;
        setGs(prev => ({ ...prev, queuedPlays: [], log: "Queue cleared. Drag cards onto player profiles to plan this turn."}));
    }

    function handleResolveQueue() {
        if (!gs || gs.phase !== "player-plan" || gs.queuedPlays.length === 0) return;
        const {steps, finalVals, finalTarget, finalDecimalPlaces, newHands, summary} = buildSteps(gs.queuedPlays, gs.hands, gs.vals, gs.target, gs.decimalPlaces, gs.round, 0, false);
        const msg = `You played: ${summary.join(" | ")}`;
        const startVals = [...gs.vals];
        const startTarget = gs.target;
        const startDP = gs.decimalPlaces;

        setGs(prev => ({...prev, phase: "player-resolving", queuedPlays: []}));
        setLiveVals(startVals);
        setLiveTarget(startTarget);
        setLiveDP(startDP);

        playSequence(steps, gs.numPlayers, startVals, startTarget, startDP, (fv,ft,fdp) => {
            resolveAfterMove(fv, ft, fdp, newHands, msg, (v,t,dp,h,l) => advanceTurn(v,t,dp,h,l));
        });
    }

    // AI takes its turn, with a slight delay to simulate thinking
    useEffect(() => {
        if (!gs || gs.phase !== "ai-turn") return;
        timerRef.current = setTimeout(async () => {
            const ai = gs.turnIndex;
            const count = gs.cardsPerTurn;
            const plays = [];
            let tempHands = gs.hands;
            let tempVals = [...gs.vals];
            let tempTarget = gs.target;
            let tempDP = gs.decimalPlaces;
            const usedCardIdxs = new Set();

            for (let i = 0; i < count; i++) {
                const move = aiChooseMove(ai, tempHands, tempVals, tempTarget, tempDP, usedCardIdxs);
                usedCardIdxs.add(move.cardIdx);
                const card = tempHands[ai][move.cardIdx];
                if (card.type === "precision") {
                    tempDP = Math.max(0, tempDP + card.dpDelta);
                } else if (card.type === "target") {
                    tempTarget = card.fn(tempTarget, tempDP);
                } else if (card.type === "all") {
                    tempVals = tempVals.map(v => card.fn(v, tempDP));
                } else if (card.type === "single") {
                    tempVals[move.targetPlayerIdx] = card.fn(tempVals[move.targetPlayerIdx], tempDP);
                }
                plays.push({cardIdx: move.cardIdx, targetPlayerIdx: move.targetPlayerIdx ?? -1});
            }

            const {steps, finalVals, finalTarget, finalDecimalPlaces, newHands, summary} = buildSteps(plays, gs.hands, gs.vals, gs.target, gs.decimalPlaces, gs.round, ai, true);
            const msg = `${gs.names[ai]} resolved ${count} card(s): ${summary.join(" | ")}`;
            const startVals = [...gs.vals];

            setLiveVals(startVals);
            setLiveTarget(gs.target);
            setLiveDP(gs.decimalPlaces);
            playSequence(steps, gs.numPlayers, startVals, gs.target, gs.decimalPlaces, (fv, ft, fdp) => {
                resolveAfterMove(fv, ft, fdp, newHands, msg, (v,t,dp,h,l) => advanceTurn(v,t,dp,h,l));
            });
        }, AI_THINK_MS);
        return () => clearTimeout(timerRef.current);
    }, [gs?.phase, gs?.turnIndex]);

    function handleStart(numAI, rounds, cardsPerTurn) {
        setGs(createInitialState(numAI, rounds, cardsPerTurn));
        setScreen("game");
    }

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            {screen === "setup" && <SetupScreen onStart={handleStart} />}
            {screen === "game"  && gs && <GameScreen gs={gs} pulsing={pulsing} targetPulsing = {targetPulsing}
                onQueuePlay={handleQueuePlay} onUnqueuePlay={handleUnqueuePlay}
                onClearQueue={handleClearQueue} onResolveQueue={handleResolveQueue}
                activeCard={activeCard} liveVals={liveVals} liveTarget={liveTarget} liveDP={liveDP}/>}
            {screen === "end"   && gs && <EndScreen gs={gs} onBack={() => setScreen("setup")} />}
        </>
    );
}

function GameScreen({gs, pulsing, targetPulsing, onQueuePlay, onUnqueuePlay, onClearQueue, onResolveQueue, activeCard, liveVals, liveTarget, liveDP}){
    const isPlanning = gs.turnIndex === 0 && gs.phase === "player-plan";
    const queueFull = gs.queuedPlays.length >= gs.cardsPerTurn;
    const usedCardIdx = new Set(gs.queuedPlays.map(p => p.cardIdx));
    const displayVals = liveVals ?? gs.vals;
    const displayTarget = liveTarget ?? gs.target;
    const displayDP = liveDP ?? gs.decimalPlaces;

    const queueByTarget = gs.queuedPlays.reduce((acc, play, queueIdx) => {
        const key = play.targetPlayerIdx === -1 ? "special" : play.targetPlayerIdx;
        if (!acc[key]) acc[key] = [];
        acc[key].push({queueIdx, label: gs.hands[0][play.cardIdx].label});
        return acc;
    }, {});

    return (
        <div style={{maxWidth:660,margin: "0 auto",padding: "1rem", fontFamily:"'DM Mono',monospace",
        background: C.bg, minHeight:"100vh", color: C.text}}>

            {/* Header */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
                <h1 style={{fontFamily:"'Cinzel',serif", fontSize:18, color:C.gold, letterSpacing:".05em"}}>Order of Operations</h1>
                <div style={{fontSize:11,color:C.textMuted,textAlign:'right',letterSpacing:'.08em'}}>
                    Round {gs.round} / {gs.totalRounds}<br/>
                    <span style={{color:C.textFaint, fontSize:10}}>{gs.totalRounds - gs.round} rounds left</span>
                </div>
            </div>

        {/* Table */}
        <div style={{position:"relative", width:"min(100%,480px)", aspectRatio:"1", margin:"0 auto 1rem"}}>
            {/* felt surface — two-layer wood ring via border + boxShadow */}
            <div style={{position:"absolute", inset:0, borderRadius:"50%",
                background:`radial-gradient(circle at 40% 35%,${C.feltGradA},${C.feltGradB})`,
                border:`4px solid #8c4d22`,
                boxShadow:`0 0 0 4px #2a0f04, 0 10px 40px rgba(0,0,0,.85), inset 0 0 24px rgba(0,0,0,.35)`,
                display:'flex', alignItems:'center', justifyContent:'center', zIndex:1}}>

                {/* Center: target + rounds */}
                <div style={{width:'25%', aspectRatio:'1', borderRadius:'50%',
                    background:`radial-gradient(circle,${C.feltInnerA},${C.feltInnerB})`, border:`1px solid ${C.feltInnerBorder}`,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                    animation: targetPulsing ? "targetPop .5s ease" : "none"}}>
                    <div style={{fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:C.feltLabel}}>Target</div>
                    <div style={{fontSize:30, fontWeight:700, color: targetPulsing ? "#1a8fd4" : C.text, transition: "color .3s"}}>{Number(displayTarget).toFixed(displayDP)}</div>
                    <div style={{fontSize:9, color:C.feltSubLabel, letterSpacing:".1em"}}>{gs.totalRounds - gs.round + 1} left</div>
                </div>
            </div>

            {/* Single active card: pops at center then flies to target */}
            {activeCard && (() => {
                return (
                    <div style={{position:"absolute", inset:0, pointerEvents:"none", zIndex:12}}>
                        <div style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%, -50%)"}}>
                            <CardPip label = {activeCard.label} type = {activeCard.type} isAi = {activeCard.isAi}
                            phase = {activeCard.phase} dx = {activeCard.dx} dy = {activeCard.dy}/>
                        </div>
                    </div>
                );
            })()}

            {/* Player seats */}
            {gs.names.map((name, i) => {
                const iconPos = seatPosition(i, gs.numPlayers, 49);
                const infoPos = seatPosition(i, gs.numPlayers, 35);
                const isActive = gs.turnIndex === i && gs.phase !== "game-over";
                const isHuman = i === 0;
                const accent = isHuman ? C.gold : C.red;
                const canTarget = isPlanning && !queueFull;
                const targetBorder = canTarget ? accent : (isActive ? accent : C.seatIdleBorder);
                return (
                    <div key={i}>
                        {/* Large invisible drop zone centred on icon */}
                        <div style={{position:"absolute", transform:"translate(-50%,-50%)", left:`${iconPos.x}%`, top:`${iconPos.y}%`,
                            width:150, height:150, zIndex:4, cursor: canTarget ? "pointer" : "default", borderRadius:"50%"}}
                            onDragOver={canTarget ? e => e.preventDefault() : undefined}
                            onDrop={canTarget ? e => {
                                e.preventDefault();
                                const cardIdx = Number(e.dataTransfer.getData("text/plain"));
                                if (Number.isInteger(cardIdx)) onQueuePlay(cardIdx, i);
                            } : undefined} />

                        {/* Emoji icon */}
                        <div style={{position:"absolute", transform:"translate(-50%,-50%)",
                            left:`${iconPos.x}%`, top:`${iconPos.y}%`, zIndex:5,
                            width:44, height:44, borderRadius:"50%",
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                            background:C.surface, border:`3px solid ${targetBorder}`,
                            boxShadow:`0 0 0 2px #2a0f04`,
                            animation: (isActive || canTarget) ? "glow 1.5s ease infinite" : "none",
                            transition:"border-color .3s", pointerEvents:"none"}}>
                            {gs.emojis[i]}
                        </div>

                        {/* Info chip */}
                        <div style={{position:"absolute", transform:"translate(-50%,-50%)",
                            left:`${infoPos.x}%`, top:`${infoPos.y}%`, zIndex:3,
                            textAlign:"center", pointerEvents:"none", minWidth:48}}>
                            <div style={{fontSize:8, letterSpacing:".1em", textTransform:"uppercase", color:C.textMuted, lineHeight:1.3}}>{name}</div>
                            <div style={{fontSize:19, fontWeight:700, lineHeight:1, color: isHuman ? C.gold : C.red,
                                animation: pulsing[i] ? "pulse .4s ease" : "none"}}>{displayVals[i].toFixed(displayDP)}</div>
                            <div style={{display:"flex", gap:2, justifyContent:"center", flexWrap:"wrap", marginTop:2}}>
                                {(queueByTarget[i] ?? []).map(entry => (
                                    <span key={entry.queueIdx} title="Click to remove"
                                        style={{fontSize:7, padding:"1px 3px", borderRadius:999, background:C.goldDim, 
                                            border:`1px solid ${C.gold}`, color:C.gold, pointerEvents:"auto", cursor:"pointer"}}
                                        onClick={isPlanning ? () => onUnqueuePlay(entry.queueIdx) : undefined}>{entry.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Special queued cards near center */}
            {(queueByTarget["special"] ?? []).length > 0 && (
            <div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, 58%)", zIndex: 6,
                display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center"}}>
                {(queueByTarget["special"] ?? []).map(entry => (
                <span key={entry.queueIdx} title="Click to remove"
                    style={{fontSize: 7, padding: "1px 4px", borderRadius: 999, background: "rgba(122,47,212,0.2)",
                    border: "1px solid #7a2fd4", color: "#9a5fd4", pointerEvents: "auto", cursor: "pointer"}}
                    onClick={isPlanning ? () => onUnqueuePlay(entry.queueIdx) : undefined}>{entry.label}</span>
                ))}
            </div>
            )}
        </div>

        {/* Log */}
        <div style={{background:C.surface, border:`1px solid ${C.borderFaint}`, borderRadius:6,
            padding:'9px 14px', fontSize:12, color:C.logText, minHeight:36, marginBottom:"1rem", fontStyle:"italic"}}
            aria-live="polite">{gs.log}</div>

        {/* Hand */}
        {gs.turnIndex === 0 && gs.phase !== "game-over" && (
            <>
                <div style={{fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:C.textFaint, marginBottom:8}}>Your hand</div>
                <div style={{display:'flex', gap:8, flexWrap:'nowrap', overflowX:'auto', paddingBottom:6, marginBottom:'1rem', touchAction:'pan-x'}}
                    onDragOver={isPlanning ? e => e.preventDefault() : undefined}
                    onDrop={isPlanning ? e => {
                        const type = e.dataTransfer.getData("application/x-queue-remove");
                        const idx = Number(e.dataTransfer.getData("text/plain"));
                        if (type === "queue" && Number.isInteger(idx)) onUnqueuePlay(idx);
                    } : undefined}>
                    {gs.hands[0].map((card, i) => {
                        const tc = cardTypeColors(card.type);
                        const isQueued = usedCardIdx.has(i);
                        const isDisabled = !isPlanning || isQueued || queueFull;
                        const badgeColor = card.type === "all" ? "#7a2fd4" : card.type === "target" ? "#1a8fd4" : card.type === "single" ? C.gold : C.typeColors.precision.border;

                        return (
                            <button key={i}
                                draggable={isPlanning && !isQueued && !queueFull}
                                onDragStart={e => {
                                    e.dataTransfer.setData("text/plain", String(i));
                                    e.dataTransfer.effectAllowed = "move";
                                }}
                                disabled={isDisabled}
                                style={{
                                    position:'relative',
                                    background: tc.bg,
                                    border:`2px solid ${isQueued ? tc.border : '#b8a070'}`,
                                    borderRadius:8,
                                    width:58, height:84,
                                    cursor: isDisabled ? 'not-allowed' : 'grab',
                                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                    animation:`dealIn .35s ease ${i*55}ms both`,
                                    transform: isQueued ? 'translateY(-10px)' : 'none',
                                    opacity: isDisabled && !isQueued ? 0.5 : 1,
                                    transition:'all .15s',
                                    boxShadow: isQueued
                                        ? `0 8px 20px rgba(212,168,75,0.45), inset 0 0 0 1px rgba(0,0,0,0.07)`
                                        : `0 4px 14px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.07)`,
                                    flexShrink:0,
                                }}>
                                <div style={{fontSize:20, fontWeight:800, color:tc.suit, fontFamily:"'DM Mono',monospace", letterSpacing:"-0.02em", lineHeight:1, textAlign:"center"}}>{card.label}</div>
                                <div style={{fontSize: 9, color: badgeColor, fontWeight: 700, marginTop: 3, background: `${badgeColor}22`, borderRadius: 99, padding: "1px 5px", letterSpacing: ".05em"}}>{card.type}</div>
                            </button>
                        );
                    })}
                </div>

                {isPlanning && (
                    <div style={{marginBottom:'1rem', background:C.surface, border:`1px solid ${C.borderFaint}`, borderRadius:8, padding:'10px 12px'}}>
                        <div style={{fontSize:10, color:C.textMuted, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8}}>
                            Turn Queue ({gs.queuedPlays.length}/{gs.cardsPerTurn})
                        </div>
                        {gs.queuedPlays.length === 0 && (
                            <div style={{fontSize:10, color:C.hintText, letterSpacing:'.04em', marginBottom:8}}>
                                Drag single cards onto players. ⚡ All and 🎯 Target cards auto-resolve — drop anywhere.
                            </div>
                        )}
                        {gs.queuedPlays.map((play, idx) => {
                            const card = gs.hands[0][play.cardIdx];
                            const targetLabel = play.targetPlayerIdx === -1
                            ? (card.type === "target" ? "target" : "all")
                            : (play.targetPlayerIdx === 0 ? "yourself" : gs.names[play.targetPlayerIdx]);
                            return (
                            <div key={`${play.cardIdx}-${idx}`} style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                <span draggable onDragStart={e => { e.dataTransfer.setData("application/x-queue-remove", "queue"); e.dataTransfer.setData("text/plain", String(idx)); }}
                                title="Drag back to hand to remove."
                                style={{ fontSize: 10, padding: "1px 5px", borderRadius: 999, border: `1px solid ${C.border}`, color: C.textMuted, cursor: "grab" }}>drag</span>
                                {idx + 1}. {card.label} → {targetLabel}
                                <button onClick={() => onUnqueuePlay(idx)}
                                style={{ marginLeft: "auto", border: "none", background: "transparent", color: C.textMuted, cursor: "pointer", fontWeight: 700 }}>x</button>
                            </div>
                            );
                        })}
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button onClick={onResolveQueue} disabled={gs.queuedPlays.length === 0}
                            style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.gold, color: C.bg,
                                cursor: gs.queuedPlays.length === 0 ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700,
                                fontFamily: "'DM Mono',monospace", opacity: gs.queuedPlays.length === 0 ? 0.45 : 1 }}>Ready</button>
                            <button onClick={onClearQueue} disabled={gs.queuedPlays.length === 0}
                            style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.textMuted,
                                cursor: gs.queuedPlays.length === 0 ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600,
                                fontFamily: "'DM Mono',monospace", opacity: gs.queuedPlays.length === 0 ? 0.45 : 1 }}>Clear</button>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* AI thinking indicator */}
        {gs.phase === 'ai-turn' && (
            <div style={{display:'flex', gap:6, alignItems:'center', fontSize:12, color:C.textMuted, fontStyle:'italic'}}>
            {[0,1,2].map(d=>(
                <div key={d} style={{width:5, height:5, borderRadius:'50%', background:C.textMuted,
                animation:`pulse .9s ease ${d*0.2}s infinite`}}/>
            ))}
            <span style={{marginLeft:4}}>{gs.names[gs.turnIndex]} is thinking…</span>
            </div>
        )}
        </div>
    );
}

// end screen 
function EndScreen({gs, onBack}) {
    const rankings = getFinalRankings(gs.vals, gs.target);
    const medals = ["🥇", "🥈", "🥉", "4️⃣"];
    const subMsg = gs.earlyWinner !== null ? `${gs.names[gs.earlyWinner]} hit the target exactly!` : `${gs.totalRounds} rounds complete - closest to ${gs.target} wins!`;
    return (
        <div style={{maxWidth:460,margin:'0 auto',padding:'1.5rem 1.25rem',
        fontFamily:"'DM Mono',monospace",animation:'slideUp .4s cubic-bezier(.34,1.56,.64,1)'}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'1.5rem',marginBottom:'1rem'}}>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,textAlign:'center',marginBottom:4,color:C.gold,letterSpacing:'.05em'}}>Game Over</h2>
            <p style={{fontSize:11,color:C.textMuted,textAlign:'center',marginBottom:'1.25rem',letterSpacing:'.06em'}}>{subMsg}</p>

            {rankings.map((r, rank) => (
            <div key={r.playerIdx} style={{display:'flex',alignItems:'center',gap:12,
                padding:'10px 14px',borderRadius:8,marginBottom:8,
                background: rank===0?C.goldDim:C.bg,
                border:`1px solid ${rank===0?C.gold:C.borderFaint}`}}>
                <div style={{fontSize:18,width:28,textAlign:'center'}}>{medals[rank]||`${rank+1}.`}</div>
                <div style={{fontSize:18}}>{gs.emojis[r.playerIdx]}</div>
                <div style={{flex:1,fontSize:13,fontWeight:600}}>{gs.names[r.playerIdx]}</div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:20,fontWeight:700,color:rank===0?C.gold:C.text}}>{r.value}</div>
                    <div style={{fontSize:10,color:C.textMuted}}>{r.distance===0?'✓ exact!':r.distance+' away'}</div>
                </div>
            </div>
            ))}
        </div>

        <button onClick={onBack} style={{width:'100%',padding:13,background:C.gold,color:C.bg,border:'none',
            borderRadius:10,fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:700,
            letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer'}}>
            Play Again
        </button>
        </div>
    );
}
