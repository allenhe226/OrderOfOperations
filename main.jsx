// root component for all files

import React from "react";
import {useState, useEffect, useRef} from "react";
import {createInitialState, replaceCard, checkExactWin, getFinalRankings} from "./logic/gameLogic.js";
import {aiChooseMove} from "./logic/aiLogic.js";
import {HAND_SIZE} from "./data/cards.js";
import {C} from "./styles/styles.js";

const AI_THINK_MS = 1500;
const CARD_POP_MS = 420;        // card springs up at center
const CARD_HOLD_MS = 80;         // brief pause at full size
const CARD_FLY_MS = 480;         // flight to target
const CARD_LAND_PAUSE_MS = 180;  // pause after landing before next card

// function for determining a player's cartesian coordinates in a circle
function seatPosition(playerIdx, total) {
    const angle = (Math.PI / 2) + (2 * Math.PI / total) * playerIdx;
    const r = 40;
    return {x: 50+r*Math.cos(angle), y: 50+r*Math.sin(angle)};
}

// used for gloabl keyframe animations
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@700&display=swap');
  @keyframes dealIn  { from{opacity:0;transform:translateY(14px) rotate(3deg)} to{opacity:1;transform:none} }
        @keyframes cardPlay {
        from { opacity:0; transform:translate(-50%, calc(-50% + 40px)) scale(.6) rotate(-8deg); }
        to   { opacity:1; transform:translate(-50%, -50%) scale(1) rotate(0deg); }
    }
    @keyframes flyToSeat {
        from { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
        to   { opacity:0; transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.86) rotate(0deg); }
    }
  @keyframes pulse   { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 100%{transform:scale(1)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes glow    { 0%,100%{box-shadow:0 0 6px ${C.glowGoldLow}} 50%{box-shadow:0 0 18px ${C.glowGoldHigh}} }
  *{box-sizing:border-box;margin:0;padding:0}
    body{background:${C.bg}}
`;


// setup screen
function SetupScreen({onStart}){
    const [numAI, setNumAI] = useState(1);
    const [rounds, setRounds] = useState(8);
    const [cardsPerTurn, setCardsPerTurn] = useState(2);
    const [customRounds, setCustom] = useState(12);
    const [useCustom, setUseCustom] = useState(false);
    const finalRounds = useCustom ? customRounds : rounds;
    const chip = (val, current, onClick, label) => (
        <button key={val}
            onClick = {onClick}
            style = {{
                padding: '7px 15px', 
                border: `1px solid ${current === val ? C.gold:C.border}`,
                borderRadius: 20,
                background: current === val ? C.goldDim : C.bg,
                color: current === val ? C.gold : C.textMuted,
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                cursor: "pointer", 
                transition: "all .20s",
            }}>
            {label || val}
        </button>
    )

    return (
        <div style={{maxWidth:480,margin:'0 auto',padding:'2rem 1.25rem',animation:'fadeIn .4s ease'}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,textAlign:'center',marginBottom:4}}>Order of Operations</h1>
        <p style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:C.textMuted,textAlign:'center',marginBottom:'1.75rem'}}>Math Card Game</p>

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
        }}>Start Game</button>
        </div>
    );
}

// game screen
export default function Main() {
    // creating the game in one immutable object
    const [screen, setScreen] = useState('setup'); // 'setup' | 'game' | 'end'
    const [gs, setGs] = useState(null);
    const [pulsing, setPulse] = useState({}); // { playerIdx: true } briefly after value changes
    // activeCard: { label, isAi, dx, dy } — the single card currently flying, or null
    const [activeCard, setActiveCard] = useState(null);
    // liveVals: shown on seats during resolution, updated card-by-card
    const [liveVals, setLiveVals] = useState(null);
    const timerRef = useRef(null);

    function triggerPulse(idx) {
        setPulse(p => ({ ...p, [idx]: true }));
        setTimeout(() => setPulse(p => ({ ...p, [idx]: false })), 500);
    }

    // Play a sequence of {label, isAi, targetIdx, newVal, playerCount} one at a time.
    // After the last card, call onDone().
    function playSequence(steps, playerCount, initialVals, onDone) {
        function playStep(i, currentVals) {
            if (i >= steps.length) {
                setActiveCard(null);
                setLiveVals(null);
                onDone();
                return;
            }
            const step = steps[i];
            const pos = seatPosition(step.targetIdx, playerCount);
            // Vector from center (50,50) to seat — multiply for long travel
            const dx = `${(pos.x - 50) * 9}%`;
            const dy = `${(pos.y - 50) * 9}%`;

            // Show card popping at center
            setActiveCard({ label: step.label, isAi: step.isAi, dx, dy, phase: 'pop' });

            // After pop+hold, switch to flying phase
            setTimeout(() => {
                setActiveCard(prev => prev ? { ...prev, phase: 'fly' } : null);

                // After flight lands, update the value on that seat
                setTimeout(() => {
                    const updatedVals = [...currentVals];
                    updatedVals[step.targetIdx] = step.newVal;
                    setLiveVals(updatedVals);
                    triggerPulse(step.targetIdx);

                    // Brief pause, then play next card
                    setTimeout(() => playStep(i + 1, updatedVals), CARD_LAND_PAUSE_MS);
                }, CARD_FLY_MS);
            }, CARD_POP_MS + CARD_HOLD_MS);
        }
        playStep(0, initialVals);
    }

    function resolveAfterMove(newVals, newHands, logMsg, nextFn) {
        const exactIdx = checkExactWin(newVals, gs.target);
        if (exactIdx !== -1) {
          setGs(prev => ({ ...prev, vals: newVals, hands: newHands,
            log: logMsg + ` — ${newVals[exactIdx] === gs.target ? (exactIdx===0?'You hit':'${gs.names[exactIdx]} hit') : ''} the target exactly!`,
            phase:'game-over', earlyWinner: exactIdx }));
          setTimeout(() => setScreen('end'), 600);
          return true;
        }
        nextFn(newVals, newHands, logMsg);
        return false;
    }

    function advanceTurn(vals, hands, log) {
        setGs(prev => {
        const nextTurn = (prev.turnIndex + 1) % prev.numPlayers;
        const newRound = nextTurn === 0 ? prev.round + 1 : prev.round;

        if (newRound > prev.totalRounds && nextTurn === 0) {
            setTimeout(() => setScreen('end'), 400);
            return {...prev, vals, hands, log, phase:'game-over', round: newRound};
        }

        const phase = nextTurn === 0 ? 'player-plan' : 'ai-turn';
        const nextLog = nextTurn === 0 ? log + ' — Your turn!' : log;
        return { ...prev, vals, hands, log: nextLog, turnIndex: nextTurn,
            round: newRound, phase, queuedPlays: [] };
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
            const who = targetIdx === 0 ? "yourself" : prev.names[targetIdx];
            const nextQueue = [...prev.queuedPlays, { cardIdx, targetIdx }];

            return {
                ...prev,
                queuedPlays: nextQueue,
                log: `Queued ${nextQueue.length}/${prev.cardsPerTurn}: "${card.label}" -> ${who}`,
            };
        });
    }

    function handleUnqueuePlay(queueIdx) {
        if (!gs || gs.phase !== "player-plan") return;
        setGs(prev => {
            if (prev.phase !== "player-plan") return prev;
            const nextQueue = prev.queuedPlays.filter((_, i) => i !== queueIdx);
            return {
                ...prev,
                queuedPlays: nextQueue,
                log: nextQueue.length === 0
                    ? "Queue cleared. Drag cards onto player profiles to plan this turn."
                    : `Queue updated (${nextQueue.length}/${prev.cardsPerTurn}).`,
            };
        });
    }

    function handleClearQueue() {
        if (!gs || gs.phase !== "player-plan") return;
        setGs(prev => ({ ...prev, queuedPlays: [], log: "Queue cleared. Drag cards onto player profiles to plan this turn." }));
    }

    function handleResolveQueue() {
        if (!gs || gs.phase !== "player-plan" || gs.queuedPlays.length === 0) return;

        const queued = gs.queuedPlays;
        let runningVals = [...gs.vals];
        let newHands = gs.hands;
        const steps = [];
        const summary = [];

        queued.forEach((play, i) => {
            const card = gs.hands[0][play.cardIdx];
            const oldVal = runningVals[play.targetIdx];
            const nextVal = card.fn(oldVal);
            runningVals[play.targetIdx] = nextVal;
            newHands = replaceCard(newHands, 0, play.cardIdx, gs.round);
            steps.push({ label: card.label, isAi: false, targetIdx: play.targetIdx, newVal: nextVal });
            const who = play.targetIdx === 0 ? "yourself" : gs.names[play.targetIdx];
            summary.push(`${i + 1}) ${card.label} on ${who}: ${oldVal} -> ${nextVal}`);
        });

        const finalVals = runningVals;
        const msg = `You resolved ${queued.length} card(s): ${summary.join(" | ")}`;

        const startVals = [...gs.vals];
        setGs(prev => ({ ...prev, phase: "player-resolving", queuedPlays: [] }));
        setLiveVals(startVals);

        playSequence(steps, gs.numPlayers, startVals, () => {
            resolveAfterMove(finalVals, newHands, msg, (v,h,l) => advanceTurn(v,h,l));
        });
    }

    // AI takes its turn, with a slight delay to simulate thinking
    useEffect(() => {
        if (!gs || gs.phase !== "ai-turn") return;
        timerRef.current = setTimeout(() => {
            const ai = gs.turnIndex;
            const count = gs.cardsPerTurn;
            let runningVals = [...gs.vals];
            let nextHands = gs.hands;
            const steps = [];
            const summary = [];

            for (let i = 0; i < count; i += 1) {
                const move = aiChooseMove(ai, nextHands, runningVals, gs.target);
                const card = nextHands[ai][move.cardIdx];
                const oldVal = runningVals[move.targetPlayerIdx];
                const newVal = card.fn(oldVal);
                runningVals[move.targetPlayerIdx] = newVal;
                nextHands = replaceCard(nextHands, ai, move.cardIdx, gs.round);
                steps.push({ label: card.label, isAi: true, targetIdx: move.targetPlayerIdx, newVal });
                const who = move.targetPlayerIdx === ai ? "itself" : gs.names[move.targetPlayerIdx];
                summary.push(`${i + 1}) ${card.label} on ${who}: ${oldVal} -> ${newVal}`);
            }

            const finalVals = runningVals;
            const msg = `${gs.names[ai]} resolved ${count} card(s): ${summary.join(" | ")}`;

            const startVals = [...gs.vals];
            setLiveVals(startVals);
            playSequence(steps, gs.numPlayers, startVals, () => {
                resolveAfterMove(finalVals, nextHands, msg, (v,h,l) => advanceTurn(v,h,l));
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
            {screen === 'setup' && <SetupScreen onStart={handleStart} />}
            {screen === 'game'  && gs && <GameScreen gs={gs} pulsing={pulsing}
                onQueuePlay={handleQueuePlay} onUnqueuePlay={handleUnqueuePlay}
                onClearQueue={handleClearQueue} onResolveQueue={handleResolveQueue}
                activeCard={activeCard} liveVals={liveVals} />}
            {screen === 'end'   && gs && <EndScreen gs={gs} onBack={()=>setScreen('setup')} />}
        </>
    );
}

function GameScreen({gs, pulsing, onQueuePlay, onUnqueuePlay, onClearQueue, onResolveQueue, activeCard, liveVals}){
    const isPlanning = gs.turnIndex === 0 && gs.phase === 'player-plan';
    const queueFull = gs.queuedPlays.length >= gs.cardsPerTurn;
    const usedCardIdx = new Set(gs.queuedPlays.map(p => p.cardIdx));
    const displayVals = liveVals ?? gs.vals;
    const queueByTarget = gs.queuedPlays.reduce((acc, play, queueIdx) => {
        if (!acc[play.targetIdx]) acc[play.targetIdx] = [];
        acc[play.targetIdx].push({ queueIdx, label: gs.hands[0][play.cardIdx].label });
        return acc;
    }, {});
    return (
        <div style={{maxWidth:660,margin:'0 auto',padding:'1rem',fontFamily:"'DM Mono',monospace",
        background:C.bg,minHeight:'100vh',color:C.text}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>Order of Operations</h1>
            <div style={{fontSize:11,color:C.textMuted,textAlign:'right',letterSpacing:'.08em'}}>
            Round {gs.round} / {gs.totalRounds}<br/>
            <span style={{color:C.textFaint,fontSize:10}}>{gs.totalRounds - gs.round} rounds left</span>
            </div>
        </div>

        {/* Circular table */}
        <div style={{position:'relative',width:'100%',paddingBottom:'100%',maxWidth:520,margin:'0 auto 1rem'}}>
            <div style={{position:'absolute',inset:0,borderRadius:'50%',
            background:`radial-gradient(circle at 40% 35%,${C.feltGradA},${C.feltGradB})`,
            border:`2px solid ${C.feltBorder}`,display:'flex',alignItems:'center',justifyContent:'center'}}>

            {/* Center: target + rounds */}
            <div style={{width:'55%',aspectRatio:'1',borderRadius:'50%',
                background:`radial-gradient(circle,${C.feltInnerA},${C.feltInnerB})`,border:`1px solid ${C.feltInnerBorder}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,position:'relative'}}>
                <div style={{fontSize:8,letterSpacing:'.2em',textTransform:'uppercase',color:C.feltLabel}}>Target</div>
                <div style={{fontSize:32,fontWeight:700,color:C.text}}>{gs.target}</div>
                <div style={{fontSize:9,color:C.feltSubLabel,letterSpacing:'.1em'}}>{gs.totalRounds - gs.round + 1} left</div>
            </div>
            </div>

            {/* Single active card: pops at center then flies to target */}
            {activeCard && (
                <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:12}}>
                    <div style={{
                        position:'absolute',
                        left:'50%', top:'50%',
                        width:58, height:84,
                        borderRadius:8,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:16, fontWeight:700,
                        background: activeCard.isAi ? C.redDim : C.goldDim,
                        border:`2px solid ${activeCard.isAi ? C.red : C.gold}`,
                        color: activeCard.isAi ? C.red : C.gold,
                        animation: activeCard.phase === 'pop'
                            ? `cardPlay ${CARD_POP_MS}ms cubic-bezier(.34,1.56,.64,1) both`
                            : `flyToSeat ${CARD_FLY_MS}ms cubic-bezier(.22,.61,.36,1) both`,
                        '--dx': activeCard.dx,
                        '--dy': activeCard.dy,
                    }}>
                        {activeCard.label}
                    </div>
                </div>
            )}

            {/* Player seats */}
            {gs.names.map((name, i) => {
            const { x, y } = seatPosition(i, gs.numPlayers);
            const isActive = gs.turnIndex === i && gs.phase !== 'game-over';
            const isHuman  = i === 0;
            const accent   = isHuman ? C.gold : C.red;
            const canTarget = isPlanning && !queueFull;
            const targetBorder = canTarget ? accent : (isActive ? accent : C.seatIdleBorder);
            return (
                <div key={i} style={{position:'absolute',transform:'translate(-50%,-50%)',
                left:`${x}%`,top:`${y}%`,textAlign:'center',width:90,
                cursor: canTarget ? 'pointer' : 'default'}}
                onDragOver={canTarget ? (e) => e.preventDefault() : undefined}
                onDrop={canTarget ? (e) => {
                    e.preventDefault();
                    const cardIdx = Number(e.dataTransfer.getData("text/plain"));
                    if (Number.isInteger(cardIdx)) {
                        onQueuePlay(cardIdx, i);
                    }
                } : undefined}
                role={canTarget ? 'button' : undefined}
                tabIndex={canTarget ? 0 : undefined}
                aria-label={canTarget ? `Drop card on ${name}` : undefined}>
                <div style={{width:52,height:52,borderRadius:'50%',margin:'0 auto 5px',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                    background:C.surface,border:`2px solid ${targetBorder}`,
                    animation: (isActive || canTarget) ? 'glow 1.5s ease infinite' : 'none',
                    transition:'border-color .3s'}}>
                    {gs.emojis[i]}
                </div>
                <div style={{minHeight:18,display:'flex',gap:4,justifyContent:'center',flexWrap:'wrap',marginBottom:2}}>
                    {(queueByTarget[i] ?? []).map(entry => (
                        <span
                            key={`queued-${i}-${entry.queueIdx}`}
                            title="Queued card. Click to remove from queue."
                            onClick={isPlanning ? () => onUnqueuePlay(entry.queueIdx) : undefined}
                            style={{
                                fontSize:9,
                                padding:'1px 5px',
                                borderRadius:999,
                                background:C.goldDim,
                                border:`1px solid ${C.gold}`,
                                color:C.gold,
                                cursor: isPlanning ? 'pointer' : 'default',
                            }}
                        >
                            {entry.label}
                        </span>
                    ))}
                </div>
                <div style={{fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:C.textMuted,marginBottom:2}}>{name}</div>
                <div style={{fontSize:20,fontWeight:700,color: isHuman?C.gold:C.red,
                    animation: pulsing[i] ? 'pulse .4s ease' : 'none'}}>{displayVals[i]}</div>
                <div style={{fontSize:9,color:C.textFaint,marginTop:2}}>
                    {Math.abs(gs.vals[i]-gs.target)===0?'✓ target!':Math.abs(gs.vals[i]-gs.target)+' away'}
                </div>
                </div>
            );
            })}
        </div>

        {/* Log */}
        <div style={{background:C.surface,border:`1px solid ${C.borderFaint}`,borderRadius:6,
            padding:'9px 14px',fontSize:12,color:C.logText,minHeight:36,marginBottom:'1rem',fontStyle:'italic'}}
            aria-live="polite">{gs.log}</div>

        {/* Player hand */}
        {gs.turnIndex === 0 && gs.phase !== 'game-over' && (
            <>
            <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:C.textFaint,marginBottom:8}}>Your hand</div>
            <div
                style={{display:'flex',gap:8,flexWrap:'nowrap',overflowX:'auto',paddingBottom:6,marginBottom:'1rem',touchAction:'pan-x'}}
                onDragOver={isPlanning ? (e) => e.preventDefault() : undefined}
                onDrop={isPlanning ? (e) => {
                    const type = e.dataTransfer.getData("application/x-queue-remove");
                    const idx = Number(e.dataTransfer.getData("text/plain"));
                    if (type === "queue" && Number.isInteger(idx)) {
                        onUnqueuePlay(idx);
                    }
                } : undefined}
            >
                {gs.hands[0].map((card, i) => (
                <button key={i}
                    draggable={isPlanning && !usedCardIdx.has(i) && !queueFull}
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(i));
                        e.dataTransfer.effectAllowed = "move";
                    }}
                    disabled={!isPlanning || usedCardIdx.has(i) || queueFull}
                    style={{border:`1px solid ${usedCardIdx.has(i)?C.gold:C.border}`,
                    borderRadius:10,padding:'18px 12px',minWidth:62,fontSize:16,fontWeight:700,
                    cursor: (!isPlanning || usedCardIdx.has(i) || queueFull) ? 'not-allowed' : 'grab',
                    fontFamily:"'DM Mono',monospace",color: usedCardIdx.has(i)?C.gold:C.text,
                    background: usedCardIdx.has(i)?C.goldDim:C.surface,
                    transform: usedCardIdx.has(i)?'translateY(-8px)':'none',
                    animation:`dealIn .35s ease ${i*55}ms both`,
                    opacity: (!isPlanning || usedCardIdx.has(i)) ? 0.45 : 1,
                    transition:'all .15s'}}>
                    {card.label}
                </button>
                ))}
            </div>

            {isPlanning && (
                <div style={{marginBottom:'1rem',background:C.surface,border:`1px solid ${C.borderFaint}`,borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:10,color:C.textMuted,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>
                        Turn Queue ({gs.queuedPlays.length}/{gs.cardsPerTurn})
                    </div>
                    {gs.queuedPlays.length === 0 && (
                        <div style={{fontSize:10,color:C.hintText,letterSpacing:'.04em',marginBottom:8}}>
                            Drag cards onto player profiles. Press Ready to resolve all queued cards in order.
                        </div>
                    )}
                    {gs.queuedPlays.map((play, idx) => (
                        <div key={`${play.cardIdx}-${idx}`} style={{fontSize:11,color:C.textMuted,marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
                            <span
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("application/x-queue-remove", "queue");
                                    e.dataTransfer.setData("text/plain", String(idx));
                                }}
                                title="Drag back to hand or click x to remove."
                                style={{fontSize:10,padding:'1px 5px',borderRadius:999,border:`1px solid ${C.border}`,color:C.textMuted,cursor:'grab'}}
                            >
                                drag
                            </span>
                            {idx + 1}. {gs.hands[0][play.cardIdx].label}{" -> "}{play.targetIdx === 0 ? 'You' : gs.names[play.targetIdx]}
                            <button
                                onClick={() => onUnqueuePlay(idx)}
                                style={{marginLeft:'auto',border:'none',background:'transparent',color:C.textMuted,cursor:'pointer',fontWeight:700}}
                                aria-label="Remove queued card"
                            >
                                x
                            </button>
                        </div>
                    ))}
                    <div style={{display:'flex',gap:8,marginTop:10}}>
                        <button onClick={onResolveQueue} disabled={gs.queuedPlays.length === 0}
                            style={{padding:'8px 14px',borderRadius:8,border:'none',background:C.gold,color:C.bg,
                            cursor: gs.queuedPlays.length === 0 ? 'not-allowed' : 'pointer',fontSize:11,fontWeight:700,
                            fontFamily:"'DM Mono',monospace",opacity: gs.queuedPlays.length === 0 ? 0.45 : 1}}>
                            Ready
                        </button>
                        <button onClick={onClearQueue} disabled={gs.queuedPlays.length === 0}
                            style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.textMuted,
                            cursor: gs.queuedPlays.length === 0 ? 'not-allowed' : 'pointer',fontSize:11,fontWeight:600,
                            fontFamily:"'DM Mono',monospace",opacity: gs.queuedPlays.length === 0 ? 0.45 : 1}}>
                            Clear
                        </button>
                    </div>
                </div>
            )}
            </>
        )}

        {/* AI thinking indicator */}
        {gs.phase === 'ai-turn' && (
            <div style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:C.textMuted,fontStyle:'italic'}}>
            {[0,1,2].map(d=>(
                <div key={d} style={{width:5,height:5,borderRadius:'50%',background:C.textMuted,
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
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,textAlign:'center',marginBottom:4}}>Game Over</h2>
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
