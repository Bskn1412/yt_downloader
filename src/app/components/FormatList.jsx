"use client";

export default function FormatList({
  formats = [],
  type = "video",
  onDownload,
  formatSizeMB,
  getQualityLabel,
  getQualityColor,
  getAudioBadgeColor,
}) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {formats.map((f) => (
        <div
          key={f.id}
          className="grid grid-cols-2 md:grid-cols-3 items-center gap-3 w-full p-4 rounded-xl bg-[#1f1f3399] border border-cyan-400/20 backdrop-blur hover:border-cyan-400 hover:bg-[rgba(30,30,50,0.9)] hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-all duration-300"
        >
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`px-4 py-1 text-xs font-bold rounded-full ${
                type === "audio"
                  ? getAudioBadgeColor?.(f.ext)
                  : getQualityColor?.(f.height || 0)
              }`}
            >
              {type === "video"
                ? f.resolution || "Unknown"
                : f.ext.toUpperCase()}
            </span>

            <span className="text-cyan-300 text-sm truncate">
              {type === "video"
                ? getQualityLabel?.(f.height)
                : f.isVirtualMp3
                ? `${f.mp3Bitrate} kbps`
                : f.abr
                ? `${f.abr} kbps`
                : "Unknown bitrate"}
            </span>
          </div>

          {/* SIZE */}
          <div className="text-right md:text-center font-mono text-gray-300 text-sm">
            {formatSizeMB(f.size)}
          </div>

          {/* BUTTON */}
          <div className="justify-self-end col-span-2 md:col-span-1">
            <button
              onClick={() => onDownload(f)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold"
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}