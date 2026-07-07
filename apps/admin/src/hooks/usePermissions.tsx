import { createContext, useContext, ReactNode } from "react";
import useAuthStore from "@/store/useAuthStore";

type PermissionsContextType = {
  canPerformCRUD: boolean;
  isReadOnly: boolean;
  isAdmin: boolean;
  can: (permission: string) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { canPerformCRUD, isReadOnly, checkIsAdmin, user } = useAuthStore();

  const value = {
    canPerformCRUD: canPerformCRUD(),
    isReadOnly: isReadOnly(),
    isAdmin: checkIsAdmin(),
    can: (permission: string) => {
      if (checkIsAdmin()) return true;
      
      if (user?.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }
      
      return false;
    },
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
