import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

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

/**
 * Custom hook to set hierarchical breadcrumbs
 * @param breadcrumbs - Array of breadcrumb items
 */
export const useBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
  const { setBreadcrumbs } = useBreadcrumb();

  // Create a stable reference to prevent infinite loops
  const breadcrumbsString = JSON.stringify(breadcrumbs);

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
    
    // Cleanup function to reset breadcrumbs when component unmounts
    return () => {
      setBreadcrumbs([]);
    };
  }, [breadcrumbsString, setBreadcrumbs]);
};
