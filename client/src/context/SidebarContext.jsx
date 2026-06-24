import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
