import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileWarning, 
  Radio, 
  ShieldCheck, 
  FileText,
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const publicLinks = [
  { to: '/', icon: FileWarning, label: 'Report Incident' },
  { to: '/feed', icon: Radio, label: 'Live Feed' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/incidents', icon: ShieldCheck, label: 'Manage Incidents' },
  { to: '/admin/reports', icon: FileText, label: 'Reports & Export' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          "flex flex-col border-r border-sidebar-border",
          isOpen ? "w-64" : "w-0 lg:w-16",
          "lg:relative"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 h-16 border-b border-sidebar-border",
          !isOpen && "lg:justify-center"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
            <AlertTriangle className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight transition-opacity",
            !isOpen && "lg:hidden"
          )}>
            CivicAlert
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onToggle}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {/* Public Section */}
          <div className="px-3 mb-6">
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-2",
              !isOpen && "lg:hidden"
            )}>
              Public
            </p>
            <ul className="space-y-1">
              {publicLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive(link.to) 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                        : "text-sidebar-foreground/80",
                      !isOpen && "lg:justify-center lg:px-2"
                    )}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                  >
                    <link.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={cn(!isOpen && "lg:hidden")}>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Section */}
          {isAuthenticated && (
            <div className="px-3">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-2",
                !isOpen && "lg:hidden"
              )}>
                Admin
              </p>
              <ul className="space-y-1">
                {adminLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive(link.to) 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                          : "text-sidebar-foreground/80",
                        !isOpen && "lg:justify-center lg:px-2"
                      )}
                      onClick={() => window.innerWidth < 1024 && onToggle()}
                    >
                      <link.icon className="w-5 h-5 flex-shrink-0" />
                      <span className={cn(!isOpen && "lg:hidden")}>{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* User Section */}
        {isAuthenticated && user && (
          <div className="border-t border-sidebar-border p-3">
            <div className={cn(
              "flex items-center gap-3 px-2 py-2",
              !isOpen && "lg:justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className={cn("flex-1 min-w-0", !isOpen && "lg:hidden")}>
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  !isOpen && "lg:hidden"
                )}
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-30 lg:hidden bg-card shadow-md border"
        onClick={onToggle}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
};
