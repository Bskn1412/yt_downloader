"use client";

import { Shield, Zap, Download, Music } from "lucide-react";

const features = [
  {
    icon: <Zap size={28} />,
    title: "Lightning Fast",
    desc: "Downloads start instantly with optimized servers and streaming pipeline."
  },
  {
    icon: <Shield size={28} />,
    title: "Safe & Private",
    desc: "No login, no tracking. Your downloads stay completely private."
  },
  {
    icon: <Download size={28} />,
    title: "All Resolutions",
    desc: "Download 144p to 4K videos with merged audio automatically."
  },
  {
    icon: <Music size={28} />,
    title: "Audio Extraction",
    desc: "Convert videos to MP3 instantly with multiple bitrate options."
  }
];

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-24 px-6">
      <h2 className="font-bodoni text-3xl font-bold text-center mb-14">
        Why Use Our Downloader
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="
            p-6
            rounded-xl
            bg-gradient-to-br from-[#141432] to-[#1f1f45]
            border border-cyan-400/20
            backdrop-blur
            hover:border-cyan-400
            hover:shadow-[0_0_30px_rgba(0,255,255,0.25)]
            transition-all
            duration-300
            group
            "
          >
            <div className="text-cyan-400 mb-4 group-hover:scale-110 transition">
              {f.icon}
            </div>

            <h3 className="font-semibold text-lg mb-2">
              {f.title}
            </h3>

            <p className="text-sm text-gray-400 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}