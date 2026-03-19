"use client";

import { useState, useEffect } from "react";
import "../download_model.css";

export default function DownloadModal({
  isOpen,
  onClose,
  videoData,
  onDownload,
  formatId,
  isAudioFormat = false,
}) {

  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [convertToMp3, setConvertToMp3] = useState(isAudioFormat);

  useEffect(() => {
  if (!isDownloading) return;

  const interval = setInterval(() => {
    setProgress((prev) => {
      const nextProgress = prev + Math.random() * 30;

      if (nextProgress >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadComplete(true);

        setTimeout(() => {
          onClose();
          setProgress(0);
          setDownloadComplete(false);
        }, 1500);

        return 100;
      }

      return nextProgress;
    });
  }, 300);

  return () => clearInterval(interval);
}, [isDownloading, onClose]);



  /* ---------------- DOWNLOAD ---------------- */

  const handleDownload = () => {

    setIsDownloading(true);
    setProgress(0);

    onDownload(formatId);

  };


  if (!isOpen) return null;



  return (

    <div className="modal-overlay" onClick={onClose}>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="modal-inner">

          {!isDownloading && !downloadComplete && (

            <>

              <div className="video-info-section">

                <img
                  src={videoData?.thumbnail}
                  alt="thumbnail"
                  className="modal-thumbnail"
                />

                <div className="video-details">

                  <h3 className="video-title">
                    {videoData?.title}
                  </h3>
{/* 
                  <p className="video-meta">
                    {videoData?.channel}
                  </p> */}

                  {/* <p className="video-meta">
                    Duration: {videoData?.duration}s • Views: {videoData?.views}
                  </p> */}

                </div>

              </div>

              <button
                className="download-init-btn glow-button cursor-pointer"
                onClick={handleDownload}
              >

                <span className="btn-text">
                  Initialize Download
                </span>

                <span className="btn-glow"></span>

              </button>

            </>

          )}

          {isDownloading && (
            <div className="progress-section">
              <div className="progress-title">
                Preparing Download...
              </div>
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <div className="progress-percentage">
                  {Math.floor(Math.min(progress, 100))}%
                </div>
              </div>
              <p className="progress-text">
                {Math.floor(progress) < 100
                  ? isAudioFormat
                    ? "Processing audio..."
                    : "Preparing video..."
                  : "Download starting..."}
              </p>
            </div>
          )}



          {downloadComplete && (
            <div className="complete-section">
              <div className="checkmark-icon">✓</div>
              <p className="complete-text">
                Download Complete!
              </p>
              <p className="complete-subtext">
                Your file is being downloaded...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}