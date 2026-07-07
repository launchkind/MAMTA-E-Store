"use client";

import { useEffect } from "react";
import { useUserStore } from "../../../lib/store";

const AuthInitializer = () => {
  const { verifyAuth } = useUserStore();

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  return null;
};

export default AuthInitializer;
