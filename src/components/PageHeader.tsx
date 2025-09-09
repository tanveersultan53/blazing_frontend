import React from 'react';
import { Button } from './ui/button';
import type { LucideIcon } from 'lucide-react';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  actions?: ActionButton[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children, actions }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-lg font-medium mb-0">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {actions && actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'default'}
                      size={action.size || 'default'}
                      disabled={action.disabled}
                    >
                      {IconComponent && <IconComponent />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
