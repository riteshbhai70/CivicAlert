import React from 'react';
import { ReportIncidentForm } from '@/components/forms/ReportIncidentForm';

const ReportPage: React.FC = () => {
  return (
    <div className="py-4 animate-fade-in">
      <ReportIncidentForm />
    </div>
  );
};

export default ReportPage;
