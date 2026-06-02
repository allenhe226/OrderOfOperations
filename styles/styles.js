// reusable colour tokens
export const COLORS = {
  bg:          "#0d0d0d",  // page background
  surface:     "#111111",  // card / panel background
  surfaceHigh: "#1a1a1a",  // slightly lighter surface (hover states)
  border:      "#2a2a2a",  // default border
  borderFaint: "#1e1e1e",  // very subtle border
  text:        "#e8e4d9",  // primary text
  textMuted:   "#666666",  // secondary / label text
  textFaint:   "#444444",  // very muted text
  gold:        "#c8a96e",  // player accent
  goldDim:     "#1a1610",  // gold-tinted surface
  red:         "#e05a5a",  // AI accent
  redDim:      "#1a1010",  // red-tinted surface
  felt:        "#0f1a12",  // center table area (green felt)
  feltBorder:  "#1e3320",  // felt border ring
};

// layout of application
export const S = {
  root: {
    fontFamily: "'DM Mono', monospace",
    background: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.text,
    padding: "1.5rem",
    maxWidth: 660,
    margin: "0 auto",
  },

  // ── Header ──
  header: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: COLORS.text,
    margin: 0,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: 5,
  },

  // ── Score board ──
  scoreboard: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 10,
    alignItems: "center",
    marginBottom: "1rem",
  },
  scoreBox: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    textAlign: "center",
    background: COLORS.surface,
  },
  scoreBoxYou: { borderColor: COLORS.gold },
  scoreBoxAi:  { borderColor: COLORS.red  },
  scoreName: {
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  scoreNum: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1,
    transition: "color 0.3s",
  },
  scoreNumYou: { color: COLORS.gold },
  scoreNumAi:  { color: COLORS.red  },

  targetBox: { textAlign: "center" },
  targetLabel: {
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.textFaint,
  },
  targetNum: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.text,
    lineHeight: 1,
    margin: "4px 0",
  },
  roundLabel: {
    fontSize: 10,
    color: COLORS.textFaint,
    letterSpacing: "0.1em",
  },

  // ── Progress bars ──
  progressRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: "1rem",
  },
  progressWrap: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderFaint}`,
    borderRadius: 6,
    padding: "8px 10px",
  },
  progressLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  progressTrack: {
    background: "#1a1a1a",
    borderRadius: 3,
    height: 5,
    overflow: "hidden",
  },

  // ── Center table (the "felt" zone where played cards land) ──
  table: {
    background: COLORS.felt,
    border: `1px solid ${COLORS.feltBorder}`,
    borderRadius: 12,
    minHeight: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    position: "relative",
    overflow: "hidden",
  },
  tableLabel: {
    fontSize: 9,
    color: "#2a4030",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    position: "absolute",
    top: 8,
    left: 12,
  },
  tablePlaceholder: {
    fontSize: 12,
    color: "#2a4030",
    letterSpacing: "0.1em",
  },

  // ── Log strip ──
  log: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderFaint}`,
    borderRadius: 6,
    padding: "9px 14px",
    fontSize: 12,
    color: "#888",
    minHeight: 36,
    marginBottom: "1rem",
    fontStyle: "italic",
    transition: "all 0.3s",
  },

  // ── Hand of cards ──
  handLabel: {
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.textFaint,
    marginBottom: 10,
  },
  hand: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: "1rem",
  },

  // Base card style — hover/selected variants are applied in CardTile
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "20px 14px",
    minWidth: 66,
    textAlign: "center",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    userSelect: "none",
    fontFamily: "'DM Mono', monospace",
    // Slight fan/deal-in animation when the hand first appears
    animation: "dealIn 0.35s ease both",
    transition: "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
  },
  cardHover: {
    borderColor: COLORS.gold,
    background: COLORS.goldDim,
    transform: "translateY(-6px) rotate(-1deg)",
    boxShadow: `0 8px 24px rgba(200,169,110,0.15)`,
  },
  cardSelected: {
    borderColor: COLORS.gold,
    background: COLORS.goldDim,
    color: COLORS.gold,
    transform: "translateY(-8px)",
    boxShadow: `0 0 0 2px ${COLORS.gold}44, 0 12px 28px rgba(200,169,110,0.2)`,
  },
  cardDisabled: {
    opacity: 0.3,
    cursor: "default",
    pointerEvents: "none",
  },

  // ── The card that flies into the center ──
  // (animation keyframes are injected in index.css / a <style> tag)
  playedCard: {
    background: COLORS.surface,
    border: `2px solid ${COLORS.gold}`,
    borderRadius: 12,
    width: 80,
    height: 110,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.gold,
    boxShadow: `0 0 32px rgba(200,169,110,0.25)`,
    animation: "cardPlay 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
  },
  playedCardAi: {
    borderColor: COLORS.red,
    color: COLORS.red,
    boxShadow: `0 0 32px rgba(224,90,90,0.25)`,
  },
  playedCardTarget: {
    fontSize: 10,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginTop: 6,
    opacity: 0.7,
  },

  // ── Target selector buttons ──
  targetSection: { marginBottom: "1rem" },
  targetRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  targetBtn: {
    padding: "14px 0",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    background: COLORS.surface,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.05em",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.15s ease",
  },
  targetBtnSelf: { borderColor: COLORS.gold, color: COLORS.gold },
  targetBtnOpp:  { borderColor: COLORS.red,  color: COLORS.red  },

  hint: {
    fontSize: 11,
    color: COLORS.textFaint,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: "0.04em",
  },

  // ── Game-over overlay ──
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    animation: "fadeIn 0.3s ease",
  },
  modal: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: "2.5rem 2rem",
    textAlign: "center",
    maxWidth: 300,
    animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26,
    fontWeight: 700,
    color: COLORS.text,
    margin: "0 0 8px",
  },
  modalMsg: {
    fontSize: 13,
    color: "#777",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },
  playAgainBtn: {
    padding: "12px 28px",
    background: COLORS.gold,
    color: COLORS.bg,
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
};
