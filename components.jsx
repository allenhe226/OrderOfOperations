import { useState } from "react";
import { S, COLORS } from "../styles/styles.js";
import { START_VALUE } from "../data/cards.js";

export function CardTile({card, index, isSelected, isDisabled, animDelay = 0, onSelect}) {
    // component for a card
    const [hovered, setHovered] = useState(false);
    let style = {...S.card, animationDelay: `${animDelay}ms`, color: COLORS.text};

    // change the style depending on action of card
    if (isDisabled) style = {...style, ...S.cardDisabled};
    else if (isSelected) style = {...style, ...S.cardSelected};
    else if (hovered) style = {...style, ...S.cardHover};

    return (
        <button
        style={style}
        onClick={() => !isDisabled && onSelect(index)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-pressed={isSelected}
        aria-label={`Play card: ${card.label}`}
        >
        {card.label}
        </button>
    );
}

export function ProgressBar({value, target, color, label}) {
  // Calculate max possible distance so the bar scales sensibly
  const maxDist = Math.max(Math.abs(target - START_VALUE) * 2, 1);
  const dist = Math.abs(value - target);
  const pct = Math.max(0, Math.min(100, ((maxDist - dist) / maxDist) * 100));

  return (
    <div style={S.progressWrap}>
      <div style={S.progressLabel}>{label}</div>
      <div style={S.progressTrack}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      {/* Numeric readout beside the bar */}
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
        {dist === 0 ? "✓ target!" : `${dist} away`}
      </div>
    </div>
  );
}


export function PlayedCardDisplay({playedCard}) {
  // determine the current action
  const isAi = playedCard && (playedCard.target === "ai-self" || playedCard.target === "ai-player");
  const targetName = playedCard
    ? { self: "→ you", opp: "→ AI", "ai-self": "→ AI", "ai-player": "→ you" }[playedCard.target]
    : "";

  return (
    <div style={S.table} aria-label="Table — card play area">
      <span style={S.tableLabel}>Table</span>

      {playedCard ? (
        // animation of card being placed
        <div style={{ ...S.playedCard, ...(isAi ? S.playedCardAi : {}) }}>
          <span>{playedCard.label}</span>
          <span style={S.playedCardTarget}>{targetName}</span>
        </div>
      ) : (
        // placeholder for nothing placed
        <span style={S.tablePlaceholder}>— play a card —</span>
      )}
    </div>
  );
}

export function GameOverModal({ winner, target, round, onRestart }) {
  const configs = {
    player: { emoji: "🎉", title: "You win!",  msg: `You reached ${target} in ${round} rounds.`          },
    ai:     { emoji: "😅", title: "AI wins!",  msg: `The AI reached ${target} before you. Try again!`    },
    draw:   { emoji: "🤝", title: "Draw!",     msg: `You both hit ${target} at the same time!`            },
  };
  const { emoji, title, msg } = configs[winner] ?? configs.draw;

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label="Game over">
      <div style={S.modal}>
        <div style={S.modalEmoji}>{emoji}</div>
        <h2 style={S.modalTitle}>{title}</h2>
        <p style={S.modalMsg}>{msg}</p>
        <button style={S.playAgainBtn} onClick={onRestart}>
          Play again
        </button>
      </div>
    </div>
  );
}