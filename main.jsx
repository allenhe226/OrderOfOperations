// root component for all files

import React from "react";
import {useState, useEffect, useRef} from "react";
import {createInitialState, replaceCard, checkExactWin, getFinalRankings} from "./logic/gameLogic.js";
import {aiChooseMove} from "./logic/aiLogic.js";
import {C} from "./styles/styles.js";

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
  @keyframes flyIn   { 0%{opacity:0;transform:scale(.4) translateY(60px) rotate(-12deg)} 60%{transform:scale(1.1) translateY(-4px)} 100%{opacity:1;transform:none} }
  @keyframes pulse   { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 100%{transform:scale(1)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes glow    { 0%,100%{box-shadow:0 0 6px rgba(200,169,110,.2)} 50%{box-shadow:0 0 18px rgba(200,169,110,.5)} }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d0d0d}
`;


// setup screen
function SetupScreen({onStart}){
    const [numAI, setNumAI] = useState(1);
    const [rounds, setRounds] = useState(8);
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

        <button onClick={()=>onStart(numAI, finalRounds)} style={{
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
    const timerRef = useRef(null);

    function triggerPulse(idx) {
        setPulse(p => ({ ...p, [idx]: true }));
        setTimeout(() => setPulse(p => ({ ...p, [idx]: false })), 500);
    }

    function withCardAnim(label, isAi, callback) {
        setGs(prev => ({ ...prev, playedCard: { label, isAi } }));
        setTimeout(() => {
        callback();
        setTimeout(() => setGs(prev => ({ ...prev, playedCard: null })), 180);
        }, 620);
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

        const phase = nextTurn === 0 ? 'player-select' : 'ai-turn';
        const nextLog = nextTurn === 0 ? log + ' — Your turn!' : log;
        return { ...prev, vals, hands, log: nextLog, turnIndex: nextTurn,
            round: newRound, phase, selectedCardIdx: null };
        });
    }

    // player clicks a card
    function handleSelectCard(cardIdx) {
        if (!gs || gs.phase !== "player-select") return;
        setGs(prev => ({...prev, selectedCardIdx: cardIdx, phase: "player-target", log: `"${prev.hands[0][cardIdx].label}" - who do you play it on?`}));
    }

    // player chooses to apply card on self or opponent
    function handleApplyCard(targetIdx) {
        if (!gs || gs.phase !== "player-target" || gs.selectedCardIdx === null) return;
        const card = gs.hands[0][gs.selectedCardIdx];
        const oldVal = gs.vals[targetIdx];
        const newVals = [...gs.vals];
        newVals[targetIdx] = card.fn(oldVal);

        const newHands = replaceCard(gs.hands, 0, gs.selectedCardIdx, gs.round);
        const who = targetIdx === 0 ? "yourself" : gs.names[targetIdx];
        const msg = `You played "${card.label}" on ${who}: ${oldVal} → ${newVals[targetIdx]}`;

        withCardAnim(card.label, false, () => {
            triggerPulse(targetIdx);
            resolveAfterMove(newVals, newHands, msg, (v,h,l) => advanceTurn(v,h,l));
        });
    }

    // AI takes its turn, with a slight delay to simulate thinking
    useEffect(() => {
        if (!gs || gs.phase !== "ai-turn") return;
        timerRef.current = setTimeout(() => {
            const ai = gs.turnIndex;
            const move = aiChooseMove(ai, gs.hands, gs.vals, gs.target);
            const card = gs.hands[ai][move.cardIdx];
            const oldVal = gs.vals[move.targetPlayerIdx];
            const newVals = [...gs.vals];
            newVals[move.targetPlayerIdx] = card.fn(oldVal);

            const newHands = replaceCard(gs.hands, ai, move.cardIdx, gs.round);
            const who = move.targetPlayerIdx === ai ? "itself" : gs.names[move.targetPlayerIdx];
            const msg = `${gs.names[ai]} played "${card.label}" on ${who}: ${oldVal} → ${newVals[move.targetPlayerIdx]}`;

            withCardAnim(card.label, true, () => {
                triggerPulse(move.targetPlayerIdx);
                resolveAfterMove(newVals, newHands, msg, (v,h,l) => advanceTurn(v,h,l));
            });
        }, 900);
        // clear the timer if the component rerenders
        return () => clearTimeout(timerRef.current);
    }, [gs?.phase, gs?.turnIndex]);

    function handleStart(numAI, rounds) {
        setGs(createInitialState(numAI,rounds));
        setScreen("game");
    }

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            {screen === 'setup' && <SetupScreen onStart={handleStart} />}
            {screen === 'game'  && gs && <GameScreen gs={gs} pulsing={pulsing}
                onSelectCard={handleSelectCard} onApplyCard={handleApplyCard} />}
            {screen === 'end'   && gs && <EndScreen gs={gs} onBack={()=>setScreen('setup')} />}
        </>
    );
}

function GameScreen({gs, pulsing, onSelectCard, onApplyCard}){
    const size = 480;
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
            background:'radial-gradient(circle at 40% 35%,#152216,#0a130b)',
            border:`2px solid ${C.feltBorder}`,display:'flex',alignItems:'center',justifyContent:'center'}}>

            {/* Center: target + rounds */}
            <div style={{width:'55%',aspectRatio:'1',borderRadius:'50%',
                background:'radial-gradient(circle,#0f1a12,#091209)',border:`1px solid #1a2d1c`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,position:'relative'}}>
                <div style={{fontSize:8,letterSpacing:'.2em',textTransform:'uppercase',color:'#2a4030'}}>Target</div>
                <div style={{fontSize:32,fontWeight:700,color:C.text}}>{gs.target}</div>
                <div style={{fontSize:9,color:'#2a5030',letterSpacing:'.1em'}}>{gs.totalRounds - gs.round + 1} left</div>

                {/* Flying card animation */}
                {gs.playedCard && (
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
                    <div style={{width:64,height:90,borderRadius:8,display:'flex',flexDirection:'column',
                    alignItems:'center',justifyContent:'center',fontSize:19,fontWeight:700,
                    background: gs.playedCard.isAi ? C.redDim : C.goldDim,
                    border:`2px solid ${gs.playedCard.isAi ? C.red : C.gold}`,
                    color: gs.playedCard.isAi ? C.red : C.gold,
                    animation:'flyIn .45s cubic-bezier(.34,1.56,.64,1) both'}}>
                    {gs.playedCard.label}
                    </div>
                </div>
                )}
            </div>
            </div>

            {/* Player seats */}
            {gs.names.map((name, i) => {
            const { x, y } = seatPosition(i, gs.numPlayers);
            const isActive = gs.turnIndex === i && gs.phase !== 'game-over';
            const isHuman  = i === 0;
            const accent   = isHuman ? C.gold : C.red;
            return (
                <div key={i} style={{position:'absolute',transform:'translate(-50%,-50%)',
                left:`${x}%`,top:`${y}%`,textAlign:'center',width:90}}>
                <div style={{width:52,height:52,borderRadius:'50%',margin:'0 auto 5px',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                    background:C.surface,border:`2px solid ${isActive?accent:'#2a2a2a'}`,
                    animation: isActive ? 'glow 1.5s ease infinite' : 'none',
                    transition:'border-color .3s'}}>
                    {gs.emojis[i]}
                </div>
                <div style={{fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:C.textMuted,marginBottom:2}}>{name}</div>
                <div style={{fontSize:20,fontWeight:700,color: isHuman?C.gold:C.red,
                    animation: pulsing[i] ? 'pulse .4s ease' : 'none'}}>{gs.vals[i]}</div>
                <div style={{fontSize:9,color:C.textFaint,marginTop:2}}>
                    {Math.abs(gs.vals[i]-gs.target)===0?'✓ target!':Math.abs(gs.vals[i]-gs.target)+' away'}
                </div>
                </div>
            );
            })}
        </div>

        {/* Log */}
        <div style={{background:C.surface,border:`1px solid ${C.borderFaint}`,borderRadius:6,
            padding:'9px 14px',fontSize:12,color:'#888',minHeight:36,marginBottom:'1rem',fontStyle:'italic'}}
            aria-live="polite">{gs.log}</div>

        {/* Player hand */}
        {gs.turnIndex === 0 && gs.phase !== 'game-over' && (
            <>
            <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:C.textFaint,marginBottom:8}}>Your hand</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1rem'}}>
                {gs.hands[0].map((card, i) => (
                <button key={i} onClick={()=>onSelectCard(i)}
                    disabled={gs.phase !== 'player-select'}
                    style={{border:`1px solid ${gs.selectedCardIdx===i?C.gold:C.border}`,
                    borderRadius:10,padding:'18px 12px',minWidth:62,fontSize:16,fontWeight:700,
                    cursor:'pointer',fontFamily:"'DM Mono',monospace",color: gs.selectedCardIdx===i?C.gold:C.text,
                    background: gs.selectedCardIdx===i?C.goldDim:C.surface,
                    transform: gs.selectedCardIdx===i?'translateY(-8px)':'none',
                    animation:`dealIn .35s ease ${i*55}ms both`,
                    opacity: gs.phase==='player-select'?1:0.35,
                    transition:'all .15s'}}>
                    {card.label}
                </button>
                ))}
            </div>

            {/* Target buttons */}
            {gs.phase === 'player-target' && (
                <div style={{marginBottom:'1rem'}}>
                <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:C.textFaint,marginBottom:8}}>Play on…</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
                    {gs.names.map((name, i) => (
                    <button key={i} onClick={()=>onApplyCard(i)} style={{
                        padding:'9px 14px',borderRadius:8,background:C.surface,
                        border:`1px solid ${i===0?C.gold:C.red}`,
                        color:i===0?C.gold:C.red,
                        fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:600,cursor:'pointer'}}>
                        {i===0?'▲ Yourself':`▼ ${name}`}
                    </button>
                    ))}
                </div>
                <div style={{fontSize:10,color:'#333',letterSpacing:'.04em'}}>
                    Play on yourself to close the gap, or on an opponent to disrupt them.
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
