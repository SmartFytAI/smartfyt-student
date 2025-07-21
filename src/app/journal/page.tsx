'use client';

import { useEffect } from 'react';

import { AuthGuard } from '@/components/auth';
import { JournalPage } from '@/components/journal/journal-page';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/hooks/use-auth';
import { trackPageView } from '@/lib/analytics';

export default function JournalRoute() {
  const { user } = useAuth();

  // Track journal page view
  useEffect(() => {
    if (user?.id) {
      trackPageView('journal', {
        user_id: user.id,
      });
    }
  }, [user?.id]);

  return (
    <AuthGuard>
      <PageLayout
        title='Daily Journal'
        subtitle='Track your progress and reflect on your day'
      >
        <JournalPage userId={user?.id || ''} />
      </PageLayout>
    </AuthGuard>
  );
}
