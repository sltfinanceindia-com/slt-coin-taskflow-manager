import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  openGroups: string[];
  setOpenGroups: React.Dispatch<React.SetStateAction<string[]>>;
  toggleGroup: (label: string) => void;
  expandAllGroups: (allLabels: string[]) => void;
  collapseAllGroups: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['Main'];
    const saved = localStorage.getItem('sidebar-open-groups');
    return saved ? JSON.parse(saved) : ['Main'];
  });

  // Persist to localStorage whenever openGroups changes
  useEffect(() => {
    localStorage.setItem('sidebar-open-groups', JSON.stringify(openGroups));
  }, [openGroups]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const expandAllGroups = (allLabels: string[]) => {
    setOpenGroups(allLabels);
  };

  const collapseAllGroups = () => {
    setOpenGroups([]);
  };

  return (
    <SidebarContext.Provider value={{
      openGroups,
      setOpenGroups,
      toggleGroup,
      expandAllGroups,
      collapseAllGroups,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarState must be used within a SidebarProvider');
  }
  return context;
}
