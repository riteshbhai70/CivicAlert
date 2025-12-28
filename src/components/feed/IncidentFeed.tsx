import React, { useState, useEffect, useCallback } from 'react';
import { Incident, IncidentType, IncidentStatus, SeverityLevel } from '@/types/incident';
import { incidentApi } from '@/services/api';
import { IncidentCard } from '@/components/common/IncidentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge, SeverityBadge, IncidentTypeBadge } from '@/components/common/Badges';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Grid3X3, 
  List,
  MapPin,
  Clock,
  ThumbsUp,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const IncidentFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Filters
  const [filters, setFilters] = useState({
    type: '' as IncidentType | '',
    status: '' as IncidentStatus | '',
    severity: '' as SeverityLevel | '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await incidentApi.getAll({
        type: filters.type || undefined,
        status: filters.status || undefined,
        severity: filters.severity || undefined,
      });
      
      // Apply search filter locally
      let filtered = data;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = data.filter(
          i => i.description.toLowerCase().includes(searchLower) ||
               i.id.toLowerCase().includes(searchLower)
        );
      }
      
      setIncidents(filtered);
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch incidents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchIncidents();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleConfirm = async (id: string) => {
    try {
      await incidentApi.confirm(id);
      fetchIncidents();
      toast({
        title: 'Confirmed',
        description: 'Thank you for confirming this incident.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to confirm incident',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      severity: '',
      search: '',
    });
  };

  const hasActiveFilters = filters.type || filters.status || filters.severity || filters.search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live Feed • {incidents.length} incidents
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncidents}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-foreground" />
            )}
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-elevated p-4 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.type}
              onValueChange={(value: IncidentType | '') => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value: IncidentStatus | '') => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value: SeverityLevel | '') => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Incidents Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground">No incidents found matching your criteria.</p>
          <Button variant="link" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "space-y-4"
        )}>
          {incidents.map((incident, index) => (
            <div
              key={incident.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <IncidentCard
                incident={incident}
                onConfirm={handleConfirm}
                onViewDetails={setSelectedIncident}
                compact={viewMode === 'list'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIncident && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">
                    {selectedIncident.id}
                  </span>
                  <StatusBadge status={selectedIncident.status} />
                </div>
                <DialogTitle className="text-xl">
                  {selectedIncident.description}
                </DialogTitle>
                <DialogDescription>
                  Reported {formatDistanceToNow(new Date(selectedIncident.createdAt), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <IncidentTypeBadge type={selectedIncident.type} />
                  <SeverityBadge severity={selectedIncident.severity} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                    <p className="font-mono text-sm">
                      {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Reported At
                    </div>
                    <p className="text-sm">
                      {format(new Date(selectedIncident.createdAt), 'PPpp')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="w-4 h-4" />
                      Confirmations
                    </div>
                    <p className="text-sm font-semibold">{selectedIncident.confirmations}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Priority Score</p>
                    <p className="text-sm font-semibold">{selectedIncident.priorityScore}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedIncident.notes && selectedIncident.notes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Notes</p>
                    <div className="space-y-2">
                      {selectedIncident.notes.map((note, i) => (
                        <p key={i} className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleConfirm(selectedIncident.id);
                      setSelectedIncident(null);
                    }}
                    disabled={selectedIncident.status !== 'unverified'}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Confirm Incident
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
