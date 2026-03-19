"use client";

import { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const send = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          user_email: email,
          message: message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent!");
      setName("");
      setMessage("");
      setEmail("");
    }catch (err) {
      console.error("EmailJS Error:", err);
      toast.error("Failed to send");
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto mt-28 px-6 text-center">

      <h2 className="font-bodoni text-3xl font-bold mb-10">
        Contact / Feedback
      </h2>

      <div className="p-8 rounded-xl bg-[#1b1b3a] border border-cyan-400/20 backdrop-blur">

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-black border border-gray-700 text-sm outline-none"
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-black border border-gray-700 text-sm outline-none"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your feedback..."
          className="w-full h-32 p-4 rounded-lg bg-black border border-gray-700 text-sm outline-none"
        />

        <button
          onClick={send}
          className="mt-5 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold hover:scale-105 transition cursor-pointer"
        >
          Send Message
        </button>

      </div>
    </section>
  );
}