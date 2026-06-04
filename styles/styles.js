// reusable colour tokens
export const C = {
  bg:              "#1c0e06",  // dark walnut wood background
  surface:         "#271306",  // dark wood panel surface
  surfaceHigh:     "#341a08",  // hover surface
  border:          "#5a3518",  // warm wood-grain border
  borderFaint:     "#3a1f0d",  // very subtle warm border
  text:            "#f2ead6",  // warm cream
  textMuted:       "#a07848",  // muted warm tone
  textFaint:       "#6a4828",  // very muted warm tone
  gold:            "#d4a84b",  // rich casino gold
  goldDim:         "#2e1c07",  // gold-tinted surface
  red:             "#e05a5a",  // AI accent
  redDim:          "#2a0f0f",  // red-tinted surface
  felt:            "#1a5e30",  // rich casino green felt
  feltBorder:      "#22773c",  // felt border ring
  feltGradA:       "#1a5e30",  // outer table gradient start
  feltGradB:       "#11391f",  // outer table gradient end
  feltInnerA:      "#18402a",  // inner target disc gradient start
  feltInnerB:      "#0d351d",  // inner target disc gradient end
  feltInnerBorder: "#1a5e30",  // border around inner target disc
  feltLabel:       "#3a9055",  // "Target" caption color in table center
  feltSubLabel:    "#2d7845",  // rounds-left caption color in table center
  seatIdleBorder:  "#5a3518",  // neutral border for non-active player seat
  logText:         "#a07848",  // action log text
  hintText:        "#5a3518",  // helper hint shown during target selection
  glowGoldLow:     "rgba(212,168,75,.2)",   // low-intensity glow keyframe value
  glowGoldHigh:    "rgba(212,168,75,.5)",   // high-intensity glow keyframe value
};

// layout of application
export const S = {
  root: {
    fontFamily: "'DM Mono', monospace",
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
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
    color: C.text,
    margin: 0,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 11,
    color: C.textMuted,
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
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    textAlign: "center",
    background: C.surface,
  },
  scoreBoxYou: { borderColor: C.gold },
  scoreBoxAi:  { borderColor: C.red  },
  scoreName: {
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: C.textMuted,
    marginBottom: 6,
  },
  scoreNum: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1,
    transition: "color 0.3s",
  },
  scoreNumYou: { color: C.gold },
  scoreNumAi:  { color: C.red  },

  targetBox: { textAlign: "center" },
  targetLabel: {
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: C.textFaint,
  },
  targetNum: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1,
    margin: "4px 0",
  },
  roundLabel: {
    fontSize: 10,
    color: C.textFaint,
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
    background: C.surface,
    border: `1px solid ${C.borderFaint}`,
    borderRadius: 6,
    padding: "8px 10px",
  },
  progressLabel: {
    fontSize: 9,
    color: C.textMuted,
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
    background: C.felt,
    border: `1px solid ${C.feltBorder}`,
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
    background: C.surface,
    border: `1px solid ${C.borderFaint}`,
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
    color: C.textFaint,
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
    background: C.surface,
    border: `1px solid ${C.border}`,
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
    borderColor: C.gold,
    background: C.goldDim,
    transform: "translateY(-6px) rotate(-1deg)",
    boxShadow: `0 8px 24px rgba(200,169,110,0.15)`,
  },
  cardSelected: {
    borderColor: C.gold,
    background: C.goldDim,
    color: C.gold,
    transform: "translateY(-8px)",
    boxShadow: `0 0 0 2px ${C.gold}44, 0 12px 28px rgba(200,169,110,0.2)`,
  },
  cardDisabled: {
    opacity: 0.3,
    cursor: "default",
    pointerEvents: "none",
  },

  // ── The card that flies into the center ──
  // (animation keyframes are injected in index.css / a <style> tag)
  playedCard: {
    background: C.surface,
    border: `2px solid ${C.gold}`,
    borderRadius: 12,
    width: 80,
    height: 110,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: C.gold,
    boxShadow: `0 0 32px rgba(200,169,110,0.25)`,
    animation: "cardPlay 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
  },
  playedCardAi: {
    borderColor: C.red,
    color: C.red,
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
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: C.surface,
    color: C.text,
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.05em",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.15s ease",
  },
  targetBtnSelf: { borderColor: C.gold, color: C.gold },
  targetBtnOpp:  { borderColor: C.red,  color: C.red  },

  hint: {
    fontSize: 11,
    color: C.textFaint,
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
    background: C.surface,
    border: `1px solid ${C.border}`,
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
    color: C.text,
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
    background: C.gold,
    color: C.bg,
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

