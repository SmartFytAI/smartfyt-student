'use client';

import { AuthGuard } from '@/components/auth';
import { JournalPage } from '@/components/journal/journal-page';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/hooks/use-auth';

export default function JournalRoute() {
  const { user } = useAuth();

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
