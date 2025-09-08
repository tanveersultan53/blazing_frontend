import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

/**
 * Custom hook to set the page title in the breadcrumb
 * @param title - The title to display in the breadcrumb
 */
export const usePageTitle = (title: string) => {
  const { setPageTitle } = useBreadcrumb();

  useEffect(() => {
    setPageTitle(title);
    
    // Cleanup function to reset to default when component unmounts
    return () => {
      setPageTitle('Dashboard');
    };
  }, [title, setPageTitle]);
};
