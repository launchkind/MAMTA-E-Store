"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />

      {/* SVG ripple effects */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern
            id="ripple-pattern"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            {/* First ripple - primary */}
            <circle cx="100" cy="100" r="1" fill="#29beb3" fillOpacity="0.2">
              <animate
                attributeName="r"
                from="0"
                to="80"
                dur="4s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                from="0.3"
                to="0"
                dur="4s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Second ripple - primary */}
            <circle cx="100" cy="100" r="1" fill="#a96bde" fillOpacity="0.15">
              <animate
                attributeName="r"
                from="0"
                to="80"
                dur="4s"
                begin="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                from="0.25"
                to="0"
                dur="4s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Third ripple - primary */}
            <circle cx="100" cy="100" r="1" fill="#29beb3" fillOpacity="0.15">
              <animate
                attributeName="r"
                from="0"
                to="80"
                dur="4s"
                begin="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                from="0.2"
                to="0"
                dur="4s"
                begin="3s"
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ripple-pattern)" />
      </svg>

      {/* Collision Beams */}
      <CollisionBeams />
    </div>
  );
};

const CollisionBeams = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [beams, setBeams] = useState<
    Array<{
      id: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color: string;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    const generateBeams = () => {
      const colors = ["#29beb3", "#a96bde", "#29beb3"];
      const newBeams = Array.from({ length: 12 }, (_, i) => {
        const side = i % 4; // 0: top, 1: right, 2: bottom, 3: left
        const progress = (i % 3) / 3;

        let startX = 0,
          startY = 0,
          endX = 0,
          endY = 0;

        switch (side) {
          case 0: // Top
            startX = progress * 100;
            startY = 0;
            endX = progress * 100;
            endY = 30;
            break;
          case 1: // Right
            startX = 100;
            startY = progress * 100;
            endX = 70;
            endY = progress * 100;
            break;
          case 2: // Bottom
            startX = progress * 100;
            startY = 100;
            endX = progress * 100;
            endY = 70;
            break;
          case 3: // Left
            startX = 0;
            startY = progress * 100;
            endX = 30;
            endY = progress * 100;
            break;
        }

        return {
          id: i,
          startX,
          startY,
          endX,
          endY,
          color: colors[i % colors.length],
          delay: i * 0.8,
        };
      });

      setBeams(newBeams);
    };

    generateBeams();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {beams.map((beam) => (
            <linearGradient
              key={`gradient-${beam.id}`}
              id={`beam-gradient-${beam.id}`}
            >
              <stop offset="0%" stopColor={beam.color} stopOpacity="0" />
              <stop offset="50%" stopColor={beam.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={beam.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {beams.map((beam) => (
          <g key={beam.id}>
            <line
              x1={`${beam.startX}%`}
              y1={`${beam.startY}%`}
              x2={`${beam.endX}%`}
              y2={`${beam.endY}%`}
              stroke={`url(#beam-gradient-${beam.id})`}
              strokeWidth="2"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur="3s"
                begin={`${beam.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-width"
                values="1;3;1"
                dur="3s"
                begin={`${beam.delay}s`}
                repeatCount="indefinite"
              />
            </line>

            {/* Collision particle at end */}
            <circle
              cx={`${beam.endX}%`}
              cy={`${beam.endY}%`}
              r="0"
              fill={beam.color}
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="0;4;8;0"
                dur="3s"
                begin={`${beam.delay + 1}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.4;0"
                dur="3s"
                begin={`${beam.delay + 1}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};

BackgroundRippleEffect.displayName = "BackgroundRippleEffect";
