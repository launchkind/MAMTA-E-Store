"use client";

import { useEffect } from "react";

export default function ConsoleProtection() {
  useEffect(() => {
    // Check if console warning should be shown
    const showWarning = process.env.NEXT_PUBLIC_SHOW_CONSOLE_WARNING === "true";

    // Only enable if explicitly enabled
    if (!showWarning) {
      return;
    }

    const warningMessage = "⚠️ SECURITY WARNING: Console access is disabled.";
    const styleMessage =
      "color: #ef4444; font-size: 18px; font-weight: bold; padding: 12px 0;";

    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      table: console.table,
      clear: console.clear,
      dir: console.dir,
      dirxml: console.dirxml,
      trace: console.trace,
    };

    // Show warning message once
    originalConsole.log(`%c${warningMessage}`, styleMessage);
    originalConsole.log(
      "%c🛡️ Entry Security Protection Active",
      "color: #3b82f6; font-size: 16px; font-weight: bold; background: #eff6ff; padding: 8px 16px; border-radius: 4px;",
    );
    originalConsole.log(
      "%cDo NOT paste any code here. If someone asked you to do this, it's a scam!",
      "color: #f59e0b; font-size: 14px; font-weight: 600; padding: 8px 0;",
    );
    originalConsole.log(
      "%cNeed help? Contact: support@entry.reactbd.com",
      "color: #6b7280; font-size: 13px; padding: 4px 0;",
    );

    // Cleanup on unmount
    return () => {
      // No cleanup needed since we're not overriding console methods
    };
  }, []);

  return null;
}
