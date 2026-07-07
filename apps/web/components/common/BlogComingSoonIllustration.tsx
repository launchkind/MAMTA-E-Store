"use client";

import React from "react";
import { motion } from "framer-motion";

const BlogComingSoonIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
      {/* Background glow */}
      <div className="absolute w-[70%] h-[70%] bg-primary/20 rounded-full blur-3xl opacity-70" />

      {/* Central Main Document */}
      <motion.div
        className="relative z-10"
        initial={{ y: 0 }}
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <rect x="20" y="20" width="240" height="280" rx="24" fill="white" />
          {/* Header area of document */}
          <path
            d="M20 44C20 30.7452 30.7452 20 44 20H236C249.255 20 260 30.7452 260 44V80H20V44Z"
            fill="currentColor"
            className="text-primary/10"
          />
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="currentColor"
            className="text-primary/40"
          />
          <circle
            cx="75"
            cy="50"
            r="8"
            fill="currentColor"
            className="text-primary/20"
          />
          <circle
            cx="100"
            cy="50"
            r="8"
            fill="currentColor"
            className="text-primary/20"
          />

          {/* Text lines */}
          <rect
            x="50"
            y="110"
            width="160"
            height="12"
            rx="6"
            fill="currentColor"
            className="text-primary"
          />
          <rect
            x="50"
            y="140"
            width="180"
            height="8"
            rx="4"
            fill="currentColor"
            className="text-primary/20"
          />
          <rect
            x="50"
            y="160"
            width="150"
            height="8"
            rx="4"
            fill="currentColor"
            className="text-primary/20"
          />
          <rect
            x="50"
            y="180"
            width="170"
            height="8"
            rx="4"
            fill="currentColor"
            className="text-primary/20"
          />

          {/* Bottom graphic/chart block */}
          <rect
            x="50"
            y="220"
            width="80"
            height="40"
            rx="8"
            fill="currentColor"
            className="text-primary/10"
          />
          <rect
            x="60"
            y="240"
            width="10"
            height="15"
            rx="3"
            fill="currentColor"
            className="text-primary/40"
          />
          <rect
            x="75"
            y="235"
            width="10"
            height="20"
            rx="3"
            fill="currentColor"
            className="text-primary/60"
          />
          <rect
            x="90"
            y="245"
            width="10"
            height="10"
            rx="3"
            fill="currentColor"
            className="text-primary/30"
          />
          <rect
            x="105"
            y="230"
            width="10"
            height="25"
            rx="3"
            fill="currentColor"
            className="text-primary"
          />

          {/* Bottom right button lines */}
          <rect
            x="150"
            y="220"
            width="80"
            height="10"
            rx="5"
            fill="currentColor"
            className="text-primary/20"
          />
          <rect
            x="150"
            y="240"
            width="60"
            height="10"
            rx="5"
            fill="currentColor"
            className="text-primary/20"
          />
        </svg>
      </motion.div>

      {/* Floating Checkmark Notification */}
      <motion.div
        className="absolute top-[10%] left-[5%] md:left-[10%] z-20"
        initial={{ y: 0, rotate: -5 }}
        animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          <circle cx="40" cy="40" r="32" fill="white" />
          <circle
            cx="40"
            cy="40"
            r="24"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M30 40L36 46L50 32"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Floating Star/Like */}
      <motion.div
        className="absolute bottom-[20%] right-[0%] md:right-[5%] z-20"
        initial={{ y: 0, scale: 1, rotate: 10 }}
        animate={{ y: [0, 15, 0], scale: [1, 1.05, 1], rotate: [10, 0, 10] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          <circle cx="45" cy="45" r="35" fill="white" />
          <path
            d="M45 25L50.2201 37.8436L64.1648 39.5204L53.8127 49.0564L56.0934 62.4796L45 55.8954L33.9066 62.4796L36.1873 49.0564L25.8352 39.5204L39.7799 37.8436L45 25Z"
            fill="#FBBF24"
          />
        </svg>
      </motion.div>

      {/* Floating abstract square behind */}
      <motion.div
        className="absolute top-[20%] right-[10%] z-0"
        initial={{ x: 0, y: 0, rotate: 15 }}
        animate={{ x: [0, -10, 0], y: [0, -15, 0], rotate: [15, 25, 15] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="15"
            y="15"
            width="70"
            height="70"
            rx="16"
            fill="currentColor"
            className="text-primary/30"
          />
        </svg>
      </motion.div>

      {/* Small floating particles */}
      <motion.div
        className="absolute bottom-[25%] left-[20%] z-0"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="currentColor"
            className="text-primary/50"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-[40%] right-[25%] z-0"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: [1, 0.6, 1], opacity: [0.4, 0.2, 0.4] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="6" fill="#FBBF24" fillOpacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
};

export default BlogComingSoonIllustration;
