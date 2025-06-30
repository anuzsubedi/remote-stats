import React, { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a Sidebar component');
  }
  return context;
}

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div
        className={cn(
          'relative flex h-screen flex-col border-r bg-card transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background p-0 shadow-md"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarContentProps {
  children: React.ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {children}
    </div>
  );
}

interface SidebarHeaderProps {
  children: React.ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={cn('border-b p-4', isCollapsed && 'px-2')}>
      {isCollapsed ? (
        <div className="flex justify-center">
          <div className="h-8 w-8">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface SidebarMenuProps {
  children: React.ReactNode;
}

export function SidebarMenu({ children }: SidebarMenuProps) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {children}
    </nav>
  );
}

interface SidebarMenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarMenuItem({ 
  icon: Icon, 
  title, 
  isActive, 
  onClick
}: SidebarMenuItemProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? title : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span className="font-medium">{title}</span>}
    </button>
  );
}

interface SidebarFooterProps {
  children: React.ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={cn('border-t p-4', isCollapsed && 'px-2')}>
      {children}
    </div>
  );
} 