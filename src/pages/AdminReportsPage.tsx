import React, { useState, useEffect } from 'react';
import { Incident } from '@/types/incident';
import { incidentApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { IncidentTypeBadge, StatusBadge, SeverityBadge } from '@/components/common/Badges';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileDown, 
  FileSpreadsheet, 
  RefreshCw, 
  Download,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminReportsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const { toast } = useToast();

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentApi.getAll();
      setIncidents(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch incidents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 40, 49);
      doc.text('CivicAlert Incident Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 28);
      doc.text(`Total Incidents: ${incidents.length}`, 14, 34);

      // Table
      const tableData = incidents.map(i => [
        i.id,
        i.type.charAt(0).toUpperCase() + i.type.slice(1),
        i.description.substring(0, 40) + (i.description.length > 40 ? '...' : ''),
        `${i.latitude.toFixed(4)}, ${i.longitude.toFixed(4)}`,
        i.severity.charAt(0).toUpperCase() + i.severity.slice(1),
        i.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        format(new Date(i.createdAt), 'MM/dd/yyyy'),
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['ID', 'Type', 'Description', 'Location', 'Severity', 'Status', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 40, 49],
          textColor: 255,
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          2: { cellWidth: 45 },
        },
      });

      doc.save(`CivicAlert_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: 'PDF Exported',
        description: 'The incident report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const exportToExcel = async () => {
    setExporting('excel');
    try {
      const data = incidents.map(i => ({
        'Incident ID': i.id,
        'Type': i.type.charAt(0).toUpperCase() + i.type.slice(1),
        'Description': i.description,
        'Latitude': i.latitude,
        'Longitude': i.longitude,
        'Severity': i.severity.charAt(0).toUpperCase() + i.severity.slice(1),
        'Status': i.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        'Confirmations': i.confirmations,
        'Priority Score': i.priorityScore,
        'Created At': format(new Date(i.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        'Updated At': format(new Date(i.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
        'False Report': i.isFalseReport ? 'Yes' : 'No',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Incidents');
      
      // Auto-width columns
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `CivicAlert_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast({
        title: 'Excel Exported',
        description: 'The incident report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate Excel file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Export</h2>
          <p className="text-sm text-muted-foreground">
            Export incident data for analysis and reporting
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
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Export */}
        <div className="card-elevated p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <FileText className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Export as PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a formatted PDF report with all incident data. 
                Perfect for sharing and printing.
              </p>
              <Button
                onClick={exportToPDF}
                disabled={exporting === 'pdf' || loading || incidents.length === 0}
                className="gap-2"
              >
                {exporting === 'pdf' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Excel Export */}
        <div className="card-elevated p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <FileSpreadsheet className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Export as Excel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export all incident data to an Excel spreadsheet. 
                Includes all fields for detailed analysis.
              </p>
              <Button
                onClick={exportToExcel}
                disabled={exporting === 'excel' || loading || incidents.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exporting === 'excel' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Data Preview</h3>
          <p className="text-sm text-muted-foreground">
            {incidents.length} incidents will be included in the export
          </p>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-10 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No incidents to export
                  </TableCell>
                </TableRow>
              ) : (
                incidents.slice(0, 10).map((incident) => (
                  <TableRow key={incident.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">{incident.id}</TableCell>
                    <TableCell>
                      <IncidentTypeBadge type={incident.type} size="sm" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm">
                      {incident.description}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={incident.severity} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} size="sm" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {incidents.length > 10 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              ... and {incidents.length - 10} more incidents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
