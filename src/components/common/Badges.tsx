import React from 'react';
import { IncidentStatus, SeverityLevel, IncidentType } from '@/types/incident';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Car,
  Heart,
  Flame,
  HardHat,
  ShieldAlert
} from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<IncidentStatus, { label: string; icon: React.ElementType; className: string }> = {
  unverified: { 
    label: 'Unverified', 
    icon: Clock, 
    className: 'badge-status-unverified' 
  },
  verified: { 
    label: 'Verified', 
    icon: CheckCircle, 
    className: 'badge-status-verified' 
  },
  'in-progress': { 
    label: 'In Progress', 
    icon: AlertTriangle, 
    className: 'badge-status-in-progress' 
  },
  resolved: { 
    label: 'Resolved', 
    icon: CheckCircle, 
    className: 'badge-status-resolved' 
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      config.className,
      "inline-flex items-center gap-1",
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md';
}

const severityConfig: Record<SeverityLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'badge-severity-low' },
  medium: { label: 'Medium', className: 'badge-severity-medium' },
  high: { label: 'High', className: 'badge-severity-high' },
  critical: { label: 'Critical', className: 'badge-severity-critical' },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const config = severityConfig[severity];

  return (
    <span className={cn(
      config.className,
      "inline-flex items-center gap-1",
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {config.label}
    </span>
  );
};

interface IncidentTypeBadgeProps {
  type: IncidentType;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const typeConfig: Record<IncidentType, { label: string; icon: React.ElementType; color: string }> = {
  accident: { label: 'Accident', icon: Car, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  medical: { label: 'Medical', icon: Heart, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  fire: { label: 'Fire', icon: Flame, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  infrastructure: { label: 'Infrastructure', icon: HardHat, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  safety: { label: 'Safety', icon: ShieldAlert, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
};

export const IncidentTypeBadge: React.FC<IncidentTypeBadgeProps> = ({ 
  type, 
  showIcon = true,
  size = 'md' 
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      config.color,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {config.label}
    </span>
  );
};
