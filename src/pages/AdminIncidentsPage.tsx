import React, { useState, useEffect, useCallback } from 'react';
import { Incident, IncidentStatus, SeverityLevel, IncidentType } from '@/types/incident';
import { incidentApi } from '@/services/api';
import { StatusBadge, SeverityBadge, IncidentTypeBadge } from '@/components/common/Badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  RefreshCw,
  Eye,
  Edit,
  Ban,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const AdminIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Filters
  const [filters, setFilters] = useState({
    type: '' as IncidentType | '',
    status: '' as IncidentStatus | '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await incidentApi.getAll({
        type: filters.type || undefined,
        status: filters.status || undefined,
      });
      
      let filtered = data;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = data.filter(
          i => i.description.toLowerCase().includes(searchLower) ||
               i.id.toLowerCase().includes(searchLower)
        );
      }
      
      setIncidents(filtered);
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
  }, [fetchIncidents]);

  const handleStatusChange = async (id: string, status: IncidentStatus) => {
    try {
      await incidentApi.updateStatus(id, status);
      fetchIncidents();
      setSelectedIncident(null);
      toast({
        title: 'Status Updated',
        description: `Incident status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSeverityChange = async (id: string, severity: SeverityLevel) => {
    try {
      await incidentApi.updateSeverity(id, severity);
      fetchIncidents();
      toast({
        title: 'Severity Updated',
        description: `Incident severity changed to ${severity}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update severity',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedIncident || !newNote.trim()) return;
    
    try {
      await incidentApi.addNote(selectedIncident.id, newNote);
      fetchIncidents();
      setNewNote('');
      setNoteDialogOpen(false);
      toast({
        title: 'Note Added',
        description: 'Internal note has been added to the incident.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handleMarkFalseReport = async (id: string) => {
    try {
      await incidentApi.markFalseReport(id);
      fetchIncidents();
      setSelectedIncident(null);
      toast({
        title: 'Marked as False Report',
        description: 'The incident has been marked as a false report and resolved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark as false report',
        variant: 'destructive',
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(incidents.length / ITEMS_PER_PAGE);
  const paginatedIncidents = incidents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setFilters({ type: '', status: '', search: '' });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.type || filters.status || filters.search;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Incidents</h2>
          <p className="text-sm text-muted-foreground">
            {incidents.length} total incidents
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
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card-elevated p-4 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or description..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value: IncidentType | '') => {
                setFilters({ ...filters, type: value });
                setCurrentPage(1);
              }}
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
              onValueChange={(value: IncidentStatus | '') => {
                setFilters({ ...filters, status: value });
                setCurrentPage(1);
              }}
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
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden lg:table-cell">Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className={cn(
                      "table-row-hover",
                      incident.isFalseReport && "opacity-50"
                    )}
                  >
                    <TableCell className="font-mono text-sm">
                      {incident.id}
                    </TableCell>
                    <TableCell>
                      <IncidentTypeBadge type={incident.type} size="sm" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {incident.description}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={incident.severity} size="sm" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setEditMode(false);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setEditMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View/Edit Dialog */}
      <Dialog
        open={!!selectedIncident && !noteDialogOpen}
        onOpenChange={() => setSelectedIncident(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedIncident && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {selectedIncident.id}
                  </span>
                  {selectedIncident.isFalseReport && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                      False Report
                    </span>
                  )}
                </div>
                <DialogTitle>{editMode ? 'Edit Incident' : 'Incident Details'}</DialogTitle>
                <DialogDescription>
                  Reported {format(new Date(selectedIncident.createdAt), 'PPpp')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Type & Current Values */}
                <div className="flex flex-wrap gap-2">
                  <IncidentTypeBadge type={selectedIncident.type} />
                </div>

                {/* Editable Fields */}
                {editMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={selectedIncident.status}
                        onValueChange={(value: IncidentStatus) => 
                          handleStatusChange(selectedIncident.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unverified">Unverified</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Severity</label>
                      <Select
                        value={selectedIncident.severity}
                        onValueChange={(value: SeverityLevel) =>
                          handleSeverityChange(selectedIncident.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Read-only Details */}
                {!editMode && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Severity</p>
                      <SeverityBadge severity={selectedIncident.severity} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confirmations</p>
                      <p className="font-semibold">{selectedIncident.confirmations}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority Score</p>
                      <p className="font-semibold">{selectedIncident.priorityScore}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-mono text-xs">
                        {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedIncident.notes && selectedIncident.notes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Notes History</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedIncident.notes.map((note, i) => (
                        <p key={i} className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {editMode && !selectedIncident.isFalseReport && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setNoteDialogOpen(true)}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Add Note
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleMarkFalseReport(selectedIncident.id)}
                      className="gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      False Report
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Internal Note</DialogTitle>
            <DialogDescription>
              Add a note to this incident for internal tracking.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIncidentsPage;
