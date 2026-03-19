"use client";
import "../globals.css"
export default function Footer() {
  return (
    <footer
      className="
      w-full
      mt-32
      py-10
      border-t
      border-cyan-400/20
      text-center
      text-sm
      text-gray-400
      "
    >
      <p>
        © {new Date().getFullYear()} YT Downloader
      </p>

      <p className="mt-2">
        Built with Next.js
      </p>
      <p className="font-great-vibes mt-2 text-amber-200">Bskn</p>
    </footer>
  );
}