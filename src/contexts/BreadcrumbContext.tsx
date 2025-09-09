import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ pageTitle, setPageTitle, breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};
