"use client";

import { useState } from "react";

export default function TestPage() {
  const [url, setUrl] = useState("");
  const [formats, setFormats] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFormats = async () => {
    if (!url) return;
    setLoading(true);

    const res = await fetch("/api/formats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setMeta(data.metadata);

    // Combine all formats into one list
    const allFormats = [];

    // Video (with audio)
    data.formats.video.forEach((f) =>
      allFormats.push({ ...f, type: "Video" })
    );
    // Video Only
    data.formats.videoOnly.forEach((f) =>
      allFormats.push({ ...f, type: "Video Only" })
    );
    // Audio Only
    data.formats.audio.forEach((f) =>
      allFormats.push({ ...f, type: "Audio" })
    );

    // Add MP3 option
    allFormats.push({
      id: "mp3-convert",
      type: "Audio",
      ext: "mp3",
      resolution: "-",
      abr: "-",
      size: "-",
    });

    // Sort Video > Video Only > Audio
    allFormats.sort((a, b) => {
      const typeOrder = { Video: 3, "Video Only": 2, Audio: 1 };
      return typeOrder[b.type] - typeOrder[a.type] || (b.height || 0) - (a.height || 0);
    });

    setFormats(allFormats);
    setLoading(false);
  };

  const download = async (formatId) => {
    if (formatId === "mp3-convert") {
      // Call /api/audio for MP3 conversion
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = "audio.mp3";
      a.click();
      window.URL.revokeObjectURL(a.href);
      return;
    }

    // Normal download for video/audio streams
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, formatId }),
    });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `video.${formatId}.webm`;
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  const formatSizeMB = (size) =>
    size && size !== "-" ? (size / 1024 / 1024).toFixed(2) + " MB" : "-";

  return (
    <div style={{ padding: 40 }}>
      <h1>YT Downloader</h1>

      <input
        style={{ width: "400px", padding: "8px" }}
        placeholder="Paste YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={getFormats} style={{ marginLeft: 8 }}>
        Get Formats
      </button>

      {loading && <p style={{ marginTop: 10 }}>Loading...</p>}

      <hr style={{ margin: "20px 0" }} />

      {formats.map((f) => (
        <div
          key={f.id}
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr 100px 100px",
            alignItems: "center",
            gap: 8,
            background: "#222",
            padding: 8,
            marginBottom: 4,
            borderRadius: 6,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{f.type}</div>
          <div>
            {f.ext.toUpperCase()} {f.resolution && `| ${f.resolution}`}{" "}
            {f.abr && f.abr !== "-" ? `| ${f.abr} kbps` : ""}
          </div>
          <div style={{ color: "lightgreen" }}>{formatSizeMB(f.size)}</div>
          <button
            onClick={() => download(f.id)}
            style={{
              background: "#00bfff",
              color: "#000",
              padding: "4px 10px",
              borderRadius: 4,
              fontWeight: "bold",
            }}
          >
            Download
          </button>
        </div>
      ))}

      {meta && (
        <div style={{ marginTop: 20 }}>
          <h2>{meta.title}</h2>
          <img src={meta.thumbnail} width="400" />
          <p>Channel: {meta.channel}</p>
          <p>Views: {meta.views}</p>
          <p>Duration: {meta.duration}s</p>
        </div>
      )}
    </div>
  );
}
