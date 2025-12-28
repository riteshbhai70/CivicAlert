import React from 'react';
import { Incident } from '@/types/incident';
import { StatusBadge, SeverityBadge, IncidentTypeBadge } from './Badges';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: Incident;
  onConfirm?: (id: string) => void;
  onViewDetails?: (incident: Incident) => void;
  compact?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onConfirm,
  onViewDetails,
  compact = false,
}) => {
  const timeAgo = formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:shadow-lg hover:border-primary/30",
        incident.severity === 'critical' && "border-l-4 border-l-destructive",
        incident.severity === 'high' && "border-l-4 border-l-warning",
        compact ? "p-4" : "p-5"
      )}
    >
      {/* Priority indicator */}
      {incident.priorityScore >= 15 && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium animate-pulse-subtle">
            <AlertTriangle className="w-3 h-3" />
            High Priority
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
            <StatusBadge status={incident.status} size="sm" />
          </div>
          <IncidentTypeBadge type={incident.type} />
        </div>
      </div>

      {/* Description */}
      <p className={cn(
        "text-sm text-foreground mb-4 line-clamp-2",
        compact && "line-clamp-1"
      )}>
        {incident.description}
      </p>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <SeverityBadge severity={incident.severity} size="sm" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{incident.confirmations} confirmations</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConfirm && incident.status === 'unverified' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => onConfirm(incident.id)}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Confirm
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => onViewDetails(incident)}
            >
              Details
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Priority Score */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-muted-foreground">
          Score: {incident.priorityScore}
        </span>
      </div>
    </div>
  );
};
