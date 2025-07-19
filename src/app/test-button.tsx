'use client';

import { Button } from '@heroui/react';
import { PrimaryActionButton, SecondaryActionButton } from '@/components/ui/athletic-button';

export default function TestButtonPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Native HeroUI Buttons</h2>
        <div className="flex gap-4">
          <Button 
            color="primary" 
            variant="solid" 
            size="lg"
            radius="lg"
            startContent={<span>🚀</span>}
            className="font-semibold shadow-lg"
          >
            Sign In (Native)
          </Button>
          <Button 
            color="primary" 
            variant="bordered" 
            size="lg"
            radius="lg"
            startContent={<span>⭐</span>}
            className="font-semibold border-2"
          >
            Create Account (Native)
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Our Athletic Buttons</h2>
        <div className="flex gap-4">
          <PrimaryActionButton
            icon={<span>🚀</span>}
            size="lg"
          >
            Sign In (Athletic)
          </PrimaryActionButton>
          <SecondaryActionButton
            icon={<span>⭐</span>}
            size="lg"
          >
            Create Account (Athletic)
          </SecondaryActionButton>
        </div>
      </div>
    </div>
  );
} 