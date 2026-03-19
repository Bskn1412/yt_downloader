"use client";

const steps = [
  {
    step: "1",
    title: "Paste Link",
    desc: "Copy and paste the YouTube video URL."
  },
  {
    step: "2",
    title: "Choose Format",
    desc: "Select video quality or audio format."
  },
  {
    step: "3",
    title: "Download",
    desc: "Click download and get your file instantly."
  }
];

export default function HowItWorks() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-28 px-6">
      <h2 className="font-bodoni text-3xl font-bold text-center mb-16">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((s) => (
          <div
            key={s.step}
            className="
            text-center
            p-6
            rounded-xl
            bg-[#1b1b3a]
            border border-cyan-400/20
            hover:border-cyan-400
            transition
            "
          >
            <div
              className="
              w-12 h-12
              mx-auto
              mb-4
              rounded-full
              flex
              items-center
              justify-center
              bg-gradient-to-r
              from-cyan-400
              to-blue-500
              text-black
              font-bold
              "
            >
              {s.step}
            </div>

            <h3 className="font-semibold text-lg mb-2">
              {s.title}
            </h3>

            <p className="text-gray-400 text-sm">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}