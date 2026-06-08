import { useState, useRef } from "react";
import Head from "next/head";

const parseResponse = (text) => {
  const extract = (tag, nextTags) => {
    const start = text.indexOf(`---${tag}---`);
    if (start === -1) return "";
    let end = text.length;
    for (const t of nextTags) {
      const idx = text.indexOf(`---${t}---`, start + 1);
      if (idx !== -1 && idx < end) end = idx;
    }
    return text.slice(start + tag.length + 6, end).trim();
  };

  const scoreText = extract("SCORES", ["STRENGTHS", "CRITIQUE", "INFLUENCES", "FINAL WORD"]);
  const parseScore = (label) => {
    const match = scoreText.match(new RegExp(`${label}[:\\s]+(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  };

  return {
    verdict: extract("VERDICT", ["SCORES", "STRENGTHS", "CRITIQUE", "INFLUENCES", "FINAL WORD"]),
    scores: {
      emotional: parseScore("Emotional Resonance"),
      soul: parseScore("Soul & Narrative"),
      style: parseScore("Style & Voice"),
      technical: parseScore("Technical Mastery"),
      craft: parseScore("Craft & Execution"),
      overall: parseScore("OVERALL"),
    },
    strengths: extract("STRENGTHS", ["CRITIQUE", "INFLUENCES", "FINAL WORD"]),
    critique: extract("CRITIQUE", ["INFLUENCES", "FINAL WORD"]),
    influences: extract("INFLUENCES", ["FINAL WORD"]),
    finalWord: extract("FINAL WORD", []),
  };
};

const SCORE_DIMS = [
  { key: "emotional", label: "Emotional Resonance", weight: "40%", highlight: true },
  { key: "soul",      label: "Soul & Narrative",    weight: "25%", highlight: true },
  { key: "style",     label: "Style & Voice",       weight: "20%", highlight: false },
  { key: "technical", label: "Technical Mastery",   weight: "10%", highlight: false },
  { key: "craft",     label: "Craft & Execution",   weight: "5%",  highlight: false },
];

function ScoreBar({ label, score, weight, highlight }) {
  const getColor = (s) => {
    if (s >= 85) return "#e8c56a";
    if (s >= 70) return "#7ecbb4";
    if (s >= 55) return "#9baee0";
    return "#d08888";
  };
  const color = getColor(score);
  return (
    <div style={{ marginBottom: "18px", padding: highlight ? "14px 16px" : "10px 16px", background: highlight ? "rgba(232,197,106,0.04)" : "transparent", border: highlight ? "1px solid rgba(232,197,106,0.12)" : "1px solid transparent", borderRadius: "3px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {highlight && <span style={{ fontSize: "9px", color: "#e8c56a", fontFamily: "'Cinzel', serif" }}>★</span>}
          <span style={{ fontSize: highlight ? "12px" : "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: highlight ? "#c8b88a" : "#7a6f62", fontFamily: "'Cormorant Garamond', serif", fontWeight: highlight ? "600" : "400" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "10px", color: "#3a3530", fontFamily: "monospace" }}>{weight}</span>
          <span style={{ fontSize: highlight ? "15px" : "13px", fontWeight: "700", color, fontFamily: "monospace" }}>{score}/100</span>
        </div>
      </div>
      <div style={{ height: highlight ? "5px" : "3px", background: "#151210", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, borderRadius: "3px", boxShadow: `0 0 ${highlight ? 12 : 6}px ${color}44` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setMediaType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageData(e.target.result.split(",")[1]);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const judgeArt = async () => {
    if (!imageData) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mediaType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unknown error");
      setResult(parseResponse(data.result));
    } catch (e) {
      setError(`The Atelier encountered an error: ${e.message}`);
    }
    setLoading(false);
  };

  const overall = result?.scores?.overall || 0;
  const getMedal = (s) => s >= 90 ? "◆ MASTERWORK" : s >= 78 ? "◈ DISTINGUISHED" : s >= 63 ? "◇ COMMENDED" : "— MERIT";
  const getMedalColor = (s) => s >= 90 ? "#e8c56a" : s >= 78 ? "#b0c8c0" : s >= 63 ? "#c89090" : "#6a6060";

  return (
    <>
      <Head>
        <title>The Atelier — AI Art Judge</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Cinzel:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#0a0806", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#e0d5c8" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "56px 24px 36px", borderBottom: "1px solid #1e1a15" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: "#5a5040", textTransform: "uppercase", marginBottom: "14px", fontFamily: "'Cinzel', serif" }}>Emotion-First Judgment</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(30px, 5vw, 56px)", fontWeight: "600", letterSpacing: "0.06em", color: "#e0d5c8", margin: "0 0 6px" }}>THE ATELIER</h1>
          <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #e8c56a, transparent)", margin: "18px auto" }} />
          <p style={{ fontSize: "13px", color: "#6a5f52", letterSpacing: "0.12em", margin: 0, fontStyle: "italic" }}>Where feeling matters more than technique</p>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "44px 24px" }}>

          {/* Philosophy Banner */}
          <div style={{ padding: "16px 20px", border: "1px solid #e8c56a22", background: "#0f0c07", marginBottom: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "18px", color: "#e8c56a66" }}>♥</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#8a7a60", fontStyle: "italic", lineHeight: 1.6 }}>
              Emotional Resonance carries <strong style={{ color: "#c8a84a" }}>40%</strong> of your score. A work that moves the soul outranks a technically perfect work that feels hollow.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => !image && fileRef.current?.click()}
            style={{ border: `1px solid ${dragging ? "#e8c56a66" : image ? "#1e1a15" : "#252018"}`, borderRadius: "2px", padding: image ? "0" : "70px 24px", textAlign: "center", cursor: image ? "default" : "pointer", background: "#0d0a07", position: "relative", overflow: "hidden" }}
          >
            {image ? (
              <div style={{ position: "relative" }}>
                <img src={image} alt="Artwork" style={{ width: "100%", maxHeight: "520px", objectFit: "contain", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a0806dd 0%, transparent 45%)", display: "flex", alignItems: "flex-end", padding: "20px" }}>
                  <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{ background: "transparent", border: "1px solid #2e2820", color: "#7a6f5a", padding: "8px 18px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>Change Work</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "28px", marginBottom: "18px", opacity: 0.3 }}>◈</div>
                <div style={{ fontSize: "15px", color: "#6a6050", marginBottom: "8px", fontStyle: "italic" }}>Present your work for judgment</div>
                <div style={{ fontSize: "10px", color: "#3a3530", letterSpacing: "0.15em", textTransform: "uppercase" }}>Tap to upload your artwork</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

          {/* Submit Button */}
          {image && (
            <div style={{ textAlign: "center", marginTop: "28px" }}>
              <button onClick={judgeArt} disabled={loading} style={{ background: loading ? "#120f0a" : "linear-gradient(135deg, #161008, #241a08)", border: `1px solid ${loading ? "#2a2518" : "#e8c56a"}`, color: loading ? "#4a4030" : "#e8c56a", padding: "15px 56px", cursor: loading ? "not-allowed" : "pointer", fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>
                {loading ? "Judging..." : "Submit for Judgment"}
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "44px", color: "#4a4030" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Feeling the work · Reading the soul · Deliberating...</div>
              <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.9}}`}</style>
            </div>
          )}

          {/* Error */}
          {error && <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #3a1a1a", background: "#140808", color: "#c08080", fontSize: "13px", textAlign: "center" }}>{error}</div>}

          {/* Results */}
          {result && !loading && (
            <div style={{ marginTop: "48px" }}>
              <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #e8c56a33, transparent)", marginBottom: "44px" }} />

              <div style={{ textAlign: "center", marginBottom: "44px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.35em", color: "#4a4030", textTransform: "uppercase", fontFamily: "'Cinzel', serif", marginBottom: "14px" }}>Final Judgment</div>
                <div style={{ fontSize: "clamp(52px, 11vw, 88px)", fontWeight: "700", color: getMedalColor(overall), lineHeight: 1, fontFamily: "monospace" }}>{overall}</div>
                <div style={{ fontSize: "12px", letterSpacing: "0.25em", color: getMedalColor(overall), marginTop: "10px", fontFamily: "'Cinzel', serif" }}>{getMedal(overall)}</div>
              </div>

              <div style={{ padding: "28px", border: "1px solid #252015", background: "#0d0a07", marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#4a4030", textTransform: "uppercase", marginBottom: "14px", fontFamily: "'Cinzel', serif" }}>Verdict</div>
                <p style={{ fontSize: "18px", fontStyle: "italic", lineHeight: 1.75, color: "#c8bba8", margin: 0 }}>{result.verdict}</p>
              </div>

              <div style={{ padding: "28px", border: "1px solid #1e1a14", background: "#0d0a07", marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#4a4030", textTransform: "uppercase", marginBottom: "6px", fontFamily: "'Cinzel', serif" }}>Dimensional Scores</div>
                <div style={{ fontSize: "11px", color: "#3a3525", fontStyle: "italic", marginBottom: "22px" }}>★ = emotionally weighted</div>
                {SCORE_DIMS.map((d) => <ScoreBar key={d.key} label={d.label} score={result.scores[d.key]} weight={d.weight} highlight={d.highlight} />)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div style={{ padding: "24px", border: "1px solid #182818", background: "#090d09" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#446044", textTransform: "uppercase", marginBottom: "14px", fontFamily: "'Cinzel', serif" }}>Strengths</div>
                  <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#9ab89a", margin: 0, whiteSpace: "pre-line" }}>{result.strengths}</p>
                </div>
                <div style={{ padding: "24px", border: "1px solid #281818", background: "#0d0909" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#604444", textTransform: "uppercase", marginBottom: "14px", fontFamily: "'Cinzel', serif" }}>Critique</div>
                  <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#b89898", margin: 0, whiteSpace: "pre-line" }}>{result.critique}</p>
                </div>
              </div>

              <div style={{ padding: "24px", border: "1px solid #1e1a14", background: "#0d0a07", marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#4a4030", textTransform: "uppercase", marginBottom: "14px", fontFamily: "'Cinzel', serif" }}>Artistic Lineage</div>
                <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#a89878", margin: 0, whiteSpace: "pre-line" }}>{result.influences}</p>
              </div>

              <div style={{ padding: "36px", border: "1px solid #e8c56a22", background: "linear-gradient(135deg, #0d0a07, #160e05)", textAlign: "center" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.35em", color: "#e8c56a66", textTransform: "uppercase", marginBottom: "18px", fontFamily: "'Cinzel', serif" }}>The Atelier's Final Word</div>
                <p style={{ fontSize: "19px", fontStyle: "italic", lineHeight: 1.85, color: "#d0c09a", margin: 0 }}>{result.finalWord}</p>
              </div>

              <div style={{ textAlign: "center", marginTop: "36px" }}>
                <button onClick={() => { setImage(null); setImageData(null); setResult(null); }} style={{ background: "transparent", border: "1px solid #1e1a14", color: "#5a5040", padding: "10px 34px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>
                  Submit Another Work
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", padding: "32px", borderTop: "1px solid #141008", marginTop: "48px" }}>
          <p style={{ fontSize: "10px", color: "#2e2820", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>The Atelier · Emotion-First AI Art Analysis</p>
        </div>
      </div>
    </>
  );
}
