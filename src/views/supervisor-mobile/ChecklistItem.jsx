/**
 * ChecklistItem.jsx — SiteOS Supervisor Checklist Item
 * Full screen single item view. YES opens camera immediately.
 * NO shows reason chips. Designed for dusty site conditions.
 * Large buttons, high contrast, one tap everything.
 */

import { useState, useRef } from "react";

const DELAY_REASONS = [
  "Material not delivered",
  "Labour absent",
  "Weather conditions",
  "Equipment issue",
  "Client instruction",
  "Safety concern",
  "Other",
];

export default function ChecklistItem({ item, index, total, onResponse }) {
  const [state, setState] = useState("idle"); // idle | photo | reason
  const [photo, setPhoto] = useState(null);
  const [reason, setReason] = useState("");
  const cameraRef = useRef(null);

  function handleYes() {
    setState("photo");
    // Trigger camera input immediately
    setTimeout(() => cameraRef.current?.click(), 100);
  }

  function handlePhotoCapture(e) {
    const file = e.target.files?.[0];
    if (!file) {
      // Photo skipped — still mark as yes
      onResponse("yes", null, null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target.result);
      onResponse("yes", ev.target.result, null);
    };
    reader.readAsDataURL(file);
  }

  function handleNo() {
    setState("reason");
  }

  function handleReason(selectedReason) {
    onResponse("no", null, selectedReason);
  }

  const progress = ((index + 1) / total) * 100;

  return (
    <div style={styles.container}>
      {/* Progress Bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Counter */}
      <div style={styles.counter}>
        {index + 1} / {total}
      </div>

      {/* Item Question */}
      <div style={styles.questionWrap}>
        <div style={styles.question}>{item}</div>
      </div>

      {/* Hidden camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handlePhotoCapture}
      />

      {/* YES / NO Buttons — shown in idle state */}
      {state === "idle" && (
        <div style={styles.buttonsWrap}>
          <button style={styles.yesBtn} onClick={handleYes}>
            <span style={styles.btnIcon}>✓</span>
            <span style={styles.btnLabel}>YES</span>
          </button>
          <button style={styles.noBtn} onClick={handleNo}>
            <span style={styles.btnIcon}>✕</span>
            <span style={styles.btnLabel}>NO</span>
          </button>
          <button
            style={styles.skipBtn}
            onClick={() => onResponse("pending", null, "Skipped")}
          >
            Skip for now →
          </button>
        </div>
      )}

      {/* Camera prompt — shown after YES */}
      {state === "photo" && (
        <div style={styles.photoWrap}>
          <div style={styles.photoPrompt}>📷 Take a photo as proof</div>
          <button style={styles.cameraBtn} onClick={() => cameraRef.current?.click()}>
            TAP TO TAKE PHOTO
          </button>
          <button style={styles.skipBtn} onClick={() => onResponse("yes", null, null)}>
            Skip photo
          </button>
        </div>
      )}

      {/* Reason chips — shown after NO */}
      {state === "reason" && (
        <div style={styles.reasonWrap}>
          <div style={styles.reasonPrompt}>Why not completed?</div>
          <div style={styles.reasonGrid}>
            {DELAY_REASONS.map((r) => (
              <button
                key={r}
                style={{ ...styles.reasonChip, ...(reason === r ? styles.reasonChipActive : {}) }}
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
          {reason && (
            <button style={styles.confirmNoBtn} onClick={() => handleReason(reason)}>
              CONFIRM — {reason}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 120px)",
    background: "#FFFFFF",
    padding: "0 0 20px",
  },
  progressTrack: {
    height: 6,
    background: "#E0E0E0",
    flexShrink: 0,
  },
  progressFill: {
    height: "100%",
    background: "#FF6B00",
    transition: "width 0.3s ease",
  },
  counter: {
    textAlign: "center",
    padding: "12px 0 8px",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#888",
    fontFamily: "var(--font-heading)",
    letterSpacing: "0.05em",
  },
  questionWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 24px",
  },
  question: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.5rem",
    color: "#111111",
    textAlign: "center",
    lineHeight: 1.3,
  },
  buttonsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 20px 20px",
  },
  yesBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "24px",
    background: "#00C853",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.5rem",
    letterSpacing: "0.08em",
  },
  noBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "24px",
    background: "#D50000",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.5rem",
    letterSpacing: "0.08em",
  },
  btnIcon: { fontSize: "1.75rem" },
  btnLabel: { fontSize: "1.5rem" },
  photoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "0 20px 20px",
  },
  photoPrompt: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111",
    textAlign: "center",
  },
  cameraBtn: {
    width: "100%",
    padding: "22px",
    background: "#FF6B00",
    color: "#FFF",
    border: "none",
    borderRadius: 16,
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "1.1rem",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
  skipBtn: {
    background: "transparent",
    border: "none",
    color: "#999",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "12px",
    transition: "color 0.15s ease",
  },
  reasonWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "0 20px 20px",
  },
  reasonPrompt: {
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#111",
    textAlign: "center",
  },
  reasonGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  reasonChip: {
    padding: "12px 18px",
    background: "#F5F5F5",
    border: "2px solid #E0E0E0",
    borderRadius: 100,
    fontFamily: "var(--font-heading)",
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  reasonChipActive: {
    background: "#FFF3E0",
    border: "2px solid #FF6B00",
    color: "#FF6B00",
  },
  confirmNoBtn: {
    width: "100%",
    padding: "18px",
    background: "#111",
    color: "#FFF",
    border: "none",
    borderRadius: 16,
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    letterSpacing: "0.03em",
  },
};