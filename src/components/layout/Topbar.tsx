import React from 'react';
import { Sun, Moon, Bell, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Report Incident';
      case '/feed':
        return 'Live Incident Feed';
      case '/admin':
        return 'Admin Dashboard';
      case '/admin/incidents':
        return 'Manage Incidents';
      case '/admin/reports':
        return 'Reports & Export';
      case '/login':
        return 'Admin Login';
      default:
        return 'CivicAlert';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Real-Time Incident Reporting Platform
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live
          </div>

          {/* Notifications (placeholder) */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
          >
            <Sun className={cn(
              "w-5 h-5 absolute transition-all duration-300",
              theme === 'dark' ? "rotate-90 scale-0" : "rotate-0 scale-100"
            )} />
            <Moon className={cn(
              "w-5 h-5 absolute transition-all duration-300",
              theme === 'dark' ? "rotate-0 scale-100" : "-rotate-90 scale-0"
            )} />
          </Button>

          {/* Auth Button */}
          {!isAuthenticated ? (
            <Button asChild variant="default" size="sm" className="gap-2">
              <Link to="/login">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Login</span>
              </Link>
            </Button>
          ) : (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {user?.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};



