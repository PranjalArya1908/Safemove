"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link"; // Adjust the import path as necessary

export default function LandingPage() {
  const [adminHover, setAdminHover] = useState(false);
  const [userHover, setUserHover] = useState(false);
  const router = useRouter();

  return (
    <main className="bg-[#FFFCF8] min-h-screen text-center font-sans overflow-hidden relative">
      {/* Animated Background Glow */}
      <motion.img
        src="/gloww.png"
        alt="Background Glow"
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] z-0 pointer-events-none"
      />

      {/* Navigation */}
      <header className="flex items-center justify-between px-10 py-3.5 rounded-full shadow-md bg-white max-w-5xl mx-auto mt-10 relative z-10">
        <h1 className="text-blue-600 font-semibold text-md tracking-tighter">SafeMove</h1>
        <nav className="flex gap-8 text-gray-800 text-sm tracking-tighter">
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <a href="#">About us</a>
        </nav>
        <button className="bg-white border text-[#000000] border-gray-300 px-4.5 py-1.5 text-sm  rounded-full shadow-sm hover:shadow-md tracking-tighter">
          Get started
        </button>
      </header>

      {/* Hero Section */}
      <section className="mt-20 flex flex-col items-center px-4 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white text-gray-700 text-xs px-5 py-1.5 rounded-full shadow-md mb-6 tracking-tighter"
        >
          Women’s Safety App
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold leading-15.5 max-w-xl text-[#000000] tracking-tighter"
        >
          Now women’s move safe with{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text tracking-tighter">
            SafeMove
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 max-w-lg text-gray-600 leading-relaxed text-xs tracking-tighter"
        >
          SafeMove empowers women to travel with confidence, knowing help is just a tap away. With real-time tracking and smart safety features, every journey becomes safer and more secure.
        </motion.p>

        <div className="flex flex-row gap-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-2 text-sm rounded-full shadow-xl hover:shadow-2xl transition-all tracking-tighter"
            onClick={() => router.push("/admin")}
          >
            Admin
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-2 text-sm rounded-full shadow-xl hover:shadow-2xl transition-all tracking-tighter"
            onClick={() => router.push("/user")}
          >
            Student
          </motion.button>
        </div>
      </section>

      @media-query (max-width: 600px) and (min-width: 300px) {}
    </main>
  );
}
