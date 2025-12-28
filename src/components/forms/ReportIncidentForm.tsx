import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Locate,
  User
} from 'lucide-react';
import { IncidentFormData, IncidentType } from '@/types/incident';
import { incidentApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const incidentSchema = z.object({
  type: z.enum(['accident', 'medical', 'fire', 'infrastructure', 'safety']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  latitude: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, 'Invalid latitude (-90 to 90)'),
  longitude: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, 'Invalid longitude (-180 to 180)'),
  reporterName: z.string().max(100).optional(),
});

const incidentTypes: { value: IncidentType; label: string; icon: string }[] = [
  { value: 'accident', label: 'Accident', icon: '🚗' },
  { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'infrastructure', label: 'Infrastructure Issue', icon: '🏗️' },
  { value: 'safety', label: 'Safety Concern', icon: '⚠️' },
];

export const ReportIncidentForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState<string>('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      type: 'accident',
      description: '',
      latitude: '',
      longitude: '',
      reporterName: '',
    },
  });

  const selectedType = watch('type');

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude.toFixed(6));
          setValue('longitude', position.coords.longitude.toFixed(6));
          toast({
            title: 'Location detected',
            description: 'Your coordinates have been filled in.',
          });
        },
        (error) => {
          toast({
            title: 'Location error',
            description: 'Could not get your location. Please enter manually.',
            variant: 'destructive',
          });
        }
      );
    } else {
      toast({
        title: 'Not supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    try {
      const incident = await incidentApi.create(data);
      setIncidentId(incident.id);
      setSubmitted(true);
      toast({
        title: 'Incident Reported',
        description: `Your incident has been submitted. ID: ${incident.id}`,
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReport = () => {
    reset();
    setSubmitted(false);
    setIncidentId('');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-elevated p-8 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Submitted Successfully</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for helping keep our community safe.
          </p>
          <div className="inline-block px-4 py-2 rounded-lg bg-muted mb-6">
            <p className="text-sm text-muted-foreground">Incident ID</p>
            <p className="text-lg font-mono font-bold">{incidentId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleNewReport} variant="default">
              Report Another Incident
            </Button>
            <Button onClick={() => window.location.href = '/feed'} variant="outline">
              View Live Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <AlertTriangle className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Report an Incident</h2>
        <p className="text-muted-foreground">
          Help keep your community safe by reporting incidents in real-time.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card-elevated p-6 space-y-6">
          {/* Incident Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Incident Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value: IncidentType) => setValue('type', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the incident in detail. Include any relevant information that could help responders..."
              className="min-h-[120px] resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch('description')?.length || 0}/500 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={getLocation}
              >
                <Locate className="w-4 h-4" />
                Use My Location
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="latitude"
                  placeholder="Latitude (e.g., 37.7749)"
                  {...register('latitude')}
                  className={cn(errors.latitude && "border-destructive")}
                />
                {errors.latitude && (
                  <p className="text-xs text-destructive">{errors.latitude.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  id="longitude"
                  placeholder="Longitude (e.g., -122.4194)"
                  {...register('longitude')}
                  className={cn(errors.longitude && "border-destructive")}
                />
                {errors.longitude && (
                  <p className="text-xs text-destructive">{errors.longitude.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional: Reporter Name */}
          <div className="space-y-2">
            <Label htmlFor="reporterName" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="reporterName"
              placeholder="Enter your name (optional)"
              {...register('reporterName')}
            />
          </div>

          {/* Media Upload (UI Only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Attach Media <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports images and videos up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 mr-2" />
              Submit Incident Report
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By submitting, you confirm that this report is accurate to the best of your knowledge.
          False reports may result in penalties.
        </p>
      </form>
    </div>
  );
};
