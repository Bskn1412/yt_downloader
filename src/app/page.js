"use client";

import { useState } from "react";
import DownloadModal from "./components/Download_model";
import "./page.css";

import SkeletonCard from "./components/skeletonCard";
import ScrollTopButton from "./components/scrollToTop";
import { toast } from "sonner";

import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { API_BASE } from "/config";


export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [activeTab, setActiveTab] = useState("video");

  const fetchFormats = async () => {
    if (!url) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/formats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Failed to fetch formats");

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching formats:", error);
      toast.error("Failed to fetch video info");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (format) => {
    setSelectedFormat(format);
    setModalOpen(true);
  };

  const handleConfirmDownload = async (formatId) => {
    if (!data?.metadata?.title) return;

    try {
      const params = new URLSearchParams({
      url: url,
      formatId: selectedFormat?.isVirtualMp3
        ? selectedFormat.sourceFormatId
        : formatId,
      title: data.metadata.title,
      ext: selectedFormat?.isVirtualMp3 ? "mp3" : selectedFormat.ext,
      forceMp3: selectedFormat?.isVirtualMp3 ? "true" : "false",
      mp3Bitrate: selectedFormat?.mp3Bitrate?.toString() || "",
      mergeAudio: "true",
      });

      window.location.href = `${API_BASE}/api/download?${params.toString()}`;
      toast.success("Download started...");

    // const blob = await res.blob();

    // const link = document.createElement("a");
    // link.href = window.URL.createObjectURL(blob);

  //  const ext = selectedFormat?.isVirtualMp3
  //     ? "mp3"
  //     : selectedFormat?.ext || "webm"; 

    // link.download = `${data.metadata.title}.${ext}`;

    // document.body.appendChild(link);
    // link.click();

    // toast.success("Download completed.");

    // document.body.removeChild(link);

    // window.URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error("Download error:", error);
    toast.error("Download failed. Try another format.");
  }
};

  const formatSizeMB = (size) => {
    if (!size) return "Unknown";
    return (size / 1024 / 1024).toFixed(1) + " MB";
  };

  const estimateMp3Size = (durationSeconds, bitrateKbps) => {
  if (!durationSeconds || !bitrateKbps) return null;
  return Math.round((durationSeconds * bitrateKbps * 1000) / 8);
};

const audioDisplayFormats = (() => {

  const nativeAudio = (data?.formats?.audio || []).map((f) => ({
    ...f,
    label: `${f.ext.toUpperCase()} • ${f.abr ? f.abr + " kbps" : "-"}`,
    note: "Audio only",
    color: "badge-audio",
    isVirtualMp3: false,
  }));

  const bestAudio = [...(data?.formats?.audio || [])]
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  const mp3Virtual = bestAudio?.id
    ? [320, 192, 128].map((bitrate) => ({
        id: `mp3-${bitrate}`,
        ext: "mp3",
        size: estimateMp3Size(data?.metadata?.duration, bitrate),
        label: `MP3 • ${bitrate} kbps`,
        note: "Convert while downloading",
        isVirtualMp3: true,
        mp3Bitrate: bitrate,
        sourceFormatId: bestAudio.id,
      }))
    : [];

    return [...mp3Virtual, ...nativeAudio].sort((a, b) => {
      if (a.isVirtualMp3 && !b.isVirtualMp3) return -1;
      if (!a.isVirtualMp3 && b.isVirtualMp3) return 1;
      return (b.abr || b.mp3Bitrate || 0) - (a.abr || a.mp3Bitrate || 0);
    });

})();

  return (
  <>
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-5 sm:p-10 overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      <h1 className="font-emblema title-gradient text-4xl sm:text-5xl font-bold mb-2 text-center relative z-10">
        YT Downloader
      </h1>
      <p className="text-white text-center mb-8 text-sm sm:text-base glow-text">
        Fast, Free and Easy Video/Audio Downloads Online
      </p>

      <div className="input-container">
        <input
          className="input-field"
          placeholder="Paste video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchFormats()}
        />
        <button onClick={fetchFormats} className="fetch-button glow-button-sm">
          <span>Fetch</span>
          <span className="button-glow"></span>
        </button>
      </div>

      {loading && (
      <div className="mt-10 w-full max-w-4xl space-y-4">
        <SkeletonCard />
      </div>
    )}

      {data?.metadata && !loading && (
        <div className="mt-12 w-full max-w-4xl relative z-10">
          <div className="video-card-container">
            <div className="video-card">
              <img
                src={data.metadata.thumbnail}
                alt="thumbnail"
                className="video-thumbnail"
              />
              <div className="video-info">
                <h2 className="video-title">{data.metadata.title}</h2>
                <p className="video-channel">{data.metadata.channel}</p>
                <div className="video-stats">
                  <span className="stat-badge">
                    👁️ {(data.metadata.views / 1000000).toFixed(1)}M views
                  </span>
                  <span className="stat-badge">
                    ⏱️ {Math.floor(data.metadata.duration / 60)}m{" "}
                    {data.metadata.duration % 60}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && !loading && (
        <div className="mt-12 w-full max-w-4xl relative z-10">
          <div className="tabs-container">
            {/* <button
              className={`tab-button ${activeTab === "video" ? "active" : ""}`}
              onClick={() => setActiveTab("video")}
            >
              <span className="tab-label">Video + Audio</span>
              {data.formats.video.length > 0 && (
                <span className="tab-count">{data.formats.video.length}</span>
              )}
            </button> */}

            <button
              className={`tab-button ${
                activeTab === "videoOnly" ? "active" : ""
              }`}
              onClick={() => setActiveTab("videoOnly")}
            >
              <img src="/video.svg" height={40} width={40} alt="Audio" />
              <span className="tab-label">Video + Audio</span>
              {data.formats.videoOnly.length > 0 && (
                <span className="tab-count">
                  {data.formats.videoOnly.length}
                </span>
              )}
            </button>

            <button
              className={`tab-button ${activeTab === "audio" ? "active" : ""}`}
              onClick={() => setActiveTab("audio")}
            >
              <img src="/audio1.svg" height={50} width={50} alt="Audio" />
              <span className="table-count">Audio</span>

              {audioDisplayFormats.length > 0 && (
                <span className="tab-count">{audioDisplayFormats.length}</span>
              )}
            </button>
          </div>

          {/* Video + Audio */}
          {/* {activeTab === "video" && (
            <div className="formats-list">
              {data.formats.video.length > 0 ? (
                data.formats.video.map((f) => (
                  <div key={f.id} className="format-item">
                    <div className="format-info">
                      <div className="format-badge badge-video">
                        {f.resolution || "Unknown"}
                      </div>
                      <div className="format-details">
                        <span className="format-codec">
                          {f.ext.toUpperCase()}
                        </span>
                        <span className="format-size">
                          {formatSizeMB(f.size)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadClick(f)}
                      className="download-button button-green"
                    >
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  No video+audio formats available
                </div>
              )}
            </div>
          )} */}

          {/* Video Only */}
          {activeTab === "videoOnly" && (
            <div className="formats-list">
              {[...data.formats.videoOnly]
                .sort((a, b) => (b.height || 0) - (a.height || 0))
                .map((f) => (
                  <div key={f.id} className="format-item">
                    <div className="format-info">
                      <div
                        className={`format-badge ${getQualityColor(
                          f.height || 0
                        )}`}
                      >
                        {f.resolution || "Unknown"}
                      </div>
                     <div className="format-details grid grid-cols-3 md:grid-cols-[70px_120px_100px] items-center gap-2 w-full">
                        <span className="format-codec truncate">
                          {f.ext.toUpperCase()}
                        </span>

                        <div className="font-bold text-amber-200 truncate">
                          {getQualityLabel(f.height)}
                        </div>

                        <span className="format-size text-right font-mono whitespace-nowrap">
                          {formatSizeMB(f.size)}
                        </span>
                      </div>
                   </div>
                    <button
                      onClick={() => handleDownloadClick(f)}
                      className="download-button button-purple"
                    >
                      Download
                    </button>
                  </div>
                ))}
            </div>
          )}

        {/* Audio */}
         {activeTab === "audio" && (
          <div className="flex flex-col gap-3">

            {audioDisplayFormats.map((f) => (

             <div
              key={f.id}
              className="
                grid grid-cols-2 
                md:grid-cols-3
                items-center gap-3 w-full
                p-4
                rounded-xl
                bg-[#1f1f3399]
                border border-cyan-400/20
                backdrop-blur
                hover:border-cyan-400
                hover:bg-[rgba(30,30,50,0.902)]
                hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]
                transition-all
                duration-300
                ease
                hover:translate-x-2
              "
            >

              {/* FORMAT + BITRATE */}
              <div className="flex items-center gap-3 min-w-0">

                <span
                  className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap
                  ${getAudioBadgeColor(f.ext)}`}
                >
                  {f.ext.toUpperCase()}
                </span>

                {/* Hide bitrate on mobile */}
                <span className=" text-cyan-300 text-sm truncate">
                  {f.isVirtualMp3
                    ? `${f.mp3Bitrate} kbps`
                    : f.abr
                    ? `${f.abr} kbps`
                    : "Unknown bitrate"}
                </span>

              </div>

              {/* SIZE */}
              <div className="text-right md:text-center font-mono text-gray-300 text-sm whitespace-nowrap">
                {formatSizeMB(f.size)}
              </div>

              {/* BUTTON */}
              <div className="justify-self-end col-span-2 md:col-span-1">
                <button
                  onClick={() => handleDownloadClick(f)}
                  className="
                    w-full md:w-auto
                    px-5 py-2
                    rounded-lg
                    text-sm font-semibold
                    bg-gradient-to-r
                    from-blue-500
                    to-cyan-400
                    text-black
                    hover:shadow-[0_0_20px_rgba(0,136,255,0.6)]
                    transition
                    cursor-pointer
                    uppercase
                  "
                >
                  Download
                </button>
              </div>

            </div>
            ))}
          </div>
          )}
  

        </div>
      )}

      <DownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoData={data?.metadata}
        onDownload={handleConfirmDownload}
        formatId={selectedFormat?.id || ""}
        isVideoOnly={activeTab === "videoOnly"}
        isAudioFormat={activeTab === "audio"}
        availableAudio={data?.formats.audio || []}
      />
      <FeaturesSection />
      <HowItWorks />
      <ContactSection />
      <Footer />
      <ScrollTopButton />
    </div>
  </>
  );
}

function getQualityColor(height) {
  if (height >= 2160) return "badge-4k";
  if (height >= 1440) return "badge-1440p";
  if (height >= 1080) return "badge-1080p";
  if (height >= 720) return "badge-720p";
  if (height >= 480) return "badge-480p";
  if (height >= 360) return "badge-360p";
  if (height >= 240) return "badge-240p";
  if (height >= 144) return "badge-144p";
  return "badge-low";
}

function getQualityLabel(height) {
  if (height >= 2160) return "4K";
  if (height >= 1440) return "2K";
  if (height >= 1080) return "Full HD";
  if (height >= 720) return "HD";
  return "";
}

function getAudioBadgeColor(ext) {
  switch (ext?.toLowerCase()) {
    case "mp3":
      return "badge-audio-mp3";
    case "m4a":
      return "badge-audio-m4a";
    case "webm":
      return "badge-audio-webm";
    case "opus":
      return "badge-audio-opus";
    default:
      return "badge-audio-audio";
  }
}
