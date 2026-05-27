"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultImages = [
  "https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/753331/pexels-photo-753331.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

export default function HeroBackgroundSlideshow() {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<string[]>(defaultImages);

  useEffect(() => {
    let mounted = true;
    async function fetchHero() {
      try {
        const res = await fetch("/api/admin/hero-images");
        const json = await res.json();
        if (mounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const urls = json.data.map((it: any) => it.url).filter(Boolean);
          if (urls.length) setImages(urls);
        }
      } catch (e) {
        // keep defaults on error
      }
    }
    fetchHero();
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [images.length]);

  useEffect(() => {
    // ensure current index stays within bounds when images change
    if (current >= images.length) setCurrent(0);
  }, [images, current]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={images[current]}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
