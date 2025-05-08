'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  BellRing,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Real-Time Tracking',
    description: 'Track your location in real time and share it with trusted contacts.',
    icon: MapPin,
  },
  {
    title: 'Emergency Alerts',
    description: 'Send instant SOS alerts to your emergency contacts.',
    icon: BellRing,
  },
  {
    title: 'Safe Zones',
    description: 'Set safe zones and get alerts when boundaries are crossed.',
    icon: ShieldCheck,
  },
  {
    title: 'Trip Timer',
    description: 'Start a trip timer and alert contacts if you don’t check in on time.',
    icon: Clock,
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-[#FFFCF8] min-h-screen text-center font-sans px-6 pt-20 pb-16">
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-16">
        <h1 className="text-2xl font-semibold text-blue-600 -tracking-">SafeMove</h1>
        <Link
          href="/"
          className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow"
        >
          Back to Home
        </Link>
      </header>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-5xl font-bold mb-10 text-gray-800 tracking-tight"
      >
        App Features Designed for Your Safety
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left flex gap-4 items-start"
            >
              <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
