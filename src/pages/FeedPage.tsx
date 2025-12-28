import React from 'react';
import { IncidentFeed } from '@/components/feed/IncidentFeed';

const FeedPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <IncidentFeed />
    </div>
  );
};

export default FeedPage;
