import { useEffect, useState } from "react";

/**
 * Custom hook to prevent hydration mismatches
 * Returns false on server-side and during initial client render,
 * then true after hydration is complete
 */
export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
