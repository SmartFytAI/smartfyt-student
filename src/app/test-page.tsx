'use client';

import { AthleticCard, FeatureCard } from '@/components/ui/athletic-card';
import { PrimaryActionButton } from '@/components/ui/athletic-button';
import { AthleticIcons } from '@/components/ui/athletic-icons';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Component Test</h1>
      
      <div className="space-y-6">
        {/* Test Athletic Card */}
        <AthleticCard
          title="Test Card"
          icon={<AthleticIcons.Health />}
        >
          <p>This is a test card</p>
        </AthleticCard>

        {/* Test Feature Card */}
        <FeatureCard
          title="Test Feature"
          icon={<AthleticIcons.Performance />}
          metric={{ value: "85%", label: "Performance", progress: 85 }}
        >
          <p>This is a test feature card</p>
        </FeatureCard>

        {/* Test Button */}
        <PrimaryActionButton onClick={() => console.log('clicked')}>
          Test Button
        </PrimaryActionButton>
      </div>
    </div>
  );
} 