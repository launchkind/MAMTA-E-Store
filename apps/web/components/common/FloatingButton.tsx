"use client";

import React from "react";
import Link from "next/link";
import { Code2, Github } from "lucide-react";

const FloatingButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <Link
        href="https://buymeacoffee.com/reactbd/extras"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-zinc-900 border border-zinc-700 text-white p-3 md:px-5 md:py-3 rounded-full shadow-2xl hover:bg-zinc-800 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
      >
        <span className="flex items-center justify-center bg-white/10 rounded-full w-8 h-8 shrink-0">
          <Code2 className="w-4 h-4 text-white" />
        </span>
        <span className="font-semibold text-sm tracking-wide hidden md:block">
          Get Source Code
        </span>
      </Link>
    </div>
  );
};

export default FloatingButton;
