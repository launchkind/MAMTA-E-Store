"use client";

import React, { useState, useEffect } from "react";

interface TimeLeft {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ComingSoonCountdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          weeks: Math.floor(difference / (1000 * 60 * 60 * 24 * 7)),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 7),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className="flex gap-4 sm:gap-6 justify-center my-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/20 animate-pulse rounded-lg border border-border"></div>
            <div className="w-10 h-4 bg-muted/20 animate-pulse mt-2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const timeUnits = [
    { label: "Weeks", value: timeLeft.weeks },
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-6 justify-center md:justify-start my-5">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden group">
            <span className="text-2xl sm:text-4xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-3 uppercase tracking-wider">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ComingSoonCountdown;
