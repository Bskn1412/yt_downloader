"use client";

import { useState } from "react";
import Loader from "./Loader";
import "./index.css"
export default function Home() {

  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mp3Files, setMp3Files] = useState([]);
  const [progress, setProgress] = useState(0);

  const fetchFormats = async () => {
    if (!url) return;

    setLoading(true);

    const res = await fetch("/api/formats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  const download = async (formatId) => {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        formatId,
        title: data.metadata.title
      })
    });

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "bskn_yt--" + data.metadata.title + ".webm";
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  const formatSizeMB = (size) => {
    if (!size) return "Unknown";
    return (size / 1024 / 1024).toFixed(1) + " MB";
  };

  const fetchMp3 = async () => {
    if (!url) return;
    setLoading(true);

    const res = await fetch("/api/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await res.json();
    setMp3Files(result.files || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-5 sm:p-10">

      {/* TITLE */}
      <h1 className="title-gradient text-3xl sm:text-4xl font-bold mb-6 text-center font-serif">
        YT Downloader
      </h1>

      {/* INPUT */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <input
          className="flex-1 p-3 rounded bg-neutral-900 border border-neutral-700"
          placeholder="Paste video URL..."
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
        />
        <button
          onClick={fetchFormats}
          className="bg-white text-black px-6 py-3 rounded font-semibold cursor-pointer"
        >
          Fetch
        </button>
      </div>

   {loading &&
      <div>
        <Loader />
      </div>}
  

      {/* VIDEO CARD */}
      {data?.metadata && (
        <div className="mt-10 w-full max-w-4xl">
          <div className="bg-neutral-900 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
            <img
              src={data.metadata.thumbnail}
              className="w-full sm:w-60 rounded object-cover"
            />
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold">{data.metadata.title}</h2>
                <p className="text-neutral-400 text-sm mt-1">{data.metadata.channel}</p>
              </div>
              <div className="text-sm text-neutral-400 mt-2 sm:mt-0">
                <p>Views: {data.metadata.views}</p>
                <p>Duration: {data.metadata.duration}s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="w-full max-w-4xl mt-6">
          <div className="bg-neutral-800 h-4 rounded">
            <div className="bg-green-500 h-4 rounded" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-3xl mt-2 text-center">{progress}%</p>
        </div>
      )}

      {/* VIDEO DOWNLOADS */}
      {data && (
        <div className="mt-10 w-full max-w-4xl space-y-6 overflow-x-auto">
          <h3 className="text-2xl font-semibold mb-4">Video</h3>
          <div className="space-y-3">
            {data.formats.video.map((f)=>(
              <div key={f.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900 p-3 rounded gap-2 sm:gap-4">
                <div>{f.resolution} • {f.ext}</div>
                <div>{formatSizeMB(f.size)}</div>
                <button onClick={()=>download(f.id)} className="bg-green-500 px-4 py-1 rounded text-black font-semibold">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Only */}
      {data?.formats?.videoOnly && (
        <div className="mt-10 max-w-4xl space-y-3 overflow-x-auto">
          <h3 className="text-2xl font-semibold mb-4">Video Only (High Quality)</h3>
          {[...data.formats.videoOnly]
            .sort((a,b)=>parseInt(b.resolution)||0 - parseInt(a.resolution)||0)
            .map(f=>(
              <div key={f.id} className="flex items-start sm:items-center bg-neutral-900 p-3 rounded gap-2 sm:gap-4">
                <div className="flex-1 text-left">
                  <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                    f.resolution.includes("1920") ? "bg-yellow-900" :
                    f.resolution.includes("1280") ? "bg-green-500" :
                    f.resolution.includes("1080") ? "bg-red-500" :
                    f.resolution.includes("720") ? "bg-yellow-500" :
                    f.resolution.includes("480") ? "bg-blue-500" :
                    f.resolution.includes("426") ? "bg-blue-900" :
                    f.resolution.includes("240") ? "bg-pink-500" :
                    f.resolution.includes("144") ? "bg-lime-500" : "bg-gray-500"
                  }`}>{f.resolution}</span>
                  <span className="ml-2">{f.ext}</span>
                </div>
                <div className="text-green-400 w-24">{formatSizeMB(f.size)}</div>
                <button onClick={()=>download(f.id)} className="bg-purple-500 px-4 py-1 rounded text-black font-semibold cursor-pointer">
                  Download
                </button>
              </div>
            ))
          }
        </div>
      )}

      {/* AUDIO */}
{data?.formats?.audio && (
  <div className="mt-10  max-w-4xl space-y-3 overflow-x-auto">
    <h3 className="text-2xl font-semibold mb-4 justify-center  flex">Audio</h3>
    {data.formats.audio
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))
      .map(f => (
        <div
          key={f.id}
          className="flex flex-col sm:flex-row items-start sm:items-center bg-neutral-900 p-3 rounded gap-2 sm:gap-4"
        >
          {/* Format Badge */}
          <div className="flex-1 flex items-center gap-8">
            <span className="px-2 py-0.5 rounded-full text-sm font-semibold bg-blue-500">
              {f.ext.toUpperCase()}
            </span>
            <span className="text-pink-400">{f.abr ? `${f.abr} kbps` : "-"}</span>
 
          {/* File Size */}
          <div className="text-green-400 sm:w-24">{f.size ? (f.size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}</div>

        </div>

          {/* Download Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={() => download(f.id)}
              className="w-full sm:w-auto bg-blue-500 px-4 py-1 rounded text-black font-semibold hover:bg-blue-600 transition"
            >
              Download
            </button>
          </div>
        </div>
      ))}
  </div>
)}

      <button onClick={fetchMp3} className="mt-6 bg-purple-500 px-5 py-2 rounded font-semibold cursor-pointer">
        Convert to MP3
      </button>

      {/* MP3 Conversions */}
      {mp3Files.length > 0 && (
        <div className="mt-6 w-full max-w-4xl space-y-3 overflow-x-auto">
          <h3 className="text-2xl font-semibold mb-4">MP3 Conversions</h3>
          {mp3Files.map(f=>(
            <div key={f.bitrate} className="grid grid-cols-[150px_1fr_100px_100px] items-center gap-4 bg-neutral-800 p-3 rounded">
              <div className="font-semibold">MP3</div>
              <div className="text-pink-400">{f.bitrate} kbps</div>
              <div className="text-green-400">—</div>
              <div>
                <button onClick={async ()=>{
                  const res = await fetch(`/downloads/${f.filename}`);
                  const blob = await res.blob();
                  const a = document.createElement("a");
                  a.href = window.URL.createObjectURL(blob);
                  a.download = f.filename;
                  a.click();
                  window.URL.revokeObjectURL(a.href);
                }} className="bg-purple-500 px-4 py-1 rounded text-black font-semibold hover:bg-purple-600">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}