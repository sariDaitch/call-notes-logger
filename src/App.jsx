import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      if (window.api) {
        window.api.log("info", "Notes app started - loading saved note");
        const saved = await window.api.notes.load();
        setText(saved);
        setStatus(saved ? "Loaded previous session" : "Welcome! Start typing...");
      } else {
        console.log("Notes app started (browser mode)");
        setStatus("Browser mode (no file save)");
      }
    })();
  }, []);

  const save = async () => {
    if (window.api) {
      await window.api.notes.save(text);
      await window.api.log("info", `Saved from UI (len=${text.length})`);
      setStatus(`Saved locally & to file (${new Date().toLocaleTimeString()})`);
    } else {
      console.log("Saved to console:", text);
      setStatus("Saved (Browser console only)");
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h2>Call Notes Logger 📝</h2>
        <span className="status-bar">{status}</span>
      </div>

      <div className="editor-area">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing your call notes here... (Emojis supported 🙂🔥✨)"
          spellCheck={false}
        />
      </div>

      <div className="controls">
        <div>
          <button className="btn btn-primary" onClick={save}>
            Save Notes
          </button>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              if (window.api) {
                const loaded = await window.api.notes.load();
                setText(loaded);
                window.api.log("info", "Reload clicked");
                setStatus("Reloaded from disk");
              } else {
                console.log("Reload clicked (Browser)");
              }
            }}
          >
            Reload
          </button>
        </div>
        
        <div style={{ fontSize: "12px", color: "#ccc" }}>
           {text.length} chars
        </div>
      </div>
    </div>
  );
}
