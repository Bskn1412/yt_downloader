"use client";

export default function VideoInfoCard({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="mt-12 w-full max-w-4xl relative z-10">
      <div className="video-card-container">
        <div className="video-card">
          <img
            src={metadata.thumbnail}
            alt="thumbnail"
            className="video-thumbnail"
          />
          <div className="video-info">
            <h2 className="video-title">{metadata.title}</h2>
            <p className="video-channel">{metadata.channel}</p>

            <div className="video-stats">
              <span className="stat-badge">
                👁️ {(metadata.views / 1000000).toFixed(1)}M views
              </span>
              <span className="stat-badge">
                ⏱️ {Math.floor(metadata.duration / 60)}m{" "}
                {metadata.duration % 60}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}