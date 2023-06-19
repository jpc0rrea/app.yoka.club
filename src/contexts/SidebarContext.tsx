import { createContext, ReactNode, useState } from 'react';

export interface SidebarContextData {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarContext = createContext({} as SidebarContextData);

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
