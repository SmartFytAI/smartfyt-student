'use client';

import { useState } from 'react';

import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';
import { Journal } from '@/types';

import { JournalCalendar } from './journal-calendar';
import { JournalForm } from './journal-form';
import { JournalList } from './journal-list';

interface JournalPageProps {
  userId: string;
}

type JournalView = 'list' | 'create' | 'detail' | 'calendar';

export function JournalPage({ userId }: JournalPageProps) {
  const [currentView, setCurrentView] = useState<JournalView>('calendar');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [lastView, setLastView] = useState<'calendar' | 'list'>('calendar');

  const handleCreateNew = () => {
    logger.debug('📝 Switching to journal creation view from list');
    setLastView('list');
    setCurrentView('create');
  };

  const handleCancelCreate = () => {
    logger.debug(`📝 Canceling journal creation, returning to ${lastView}`);
    setCurrentView(lastView);
    // Refresh calendar data in case any changes were made
    if (lastView === 'calendar') {
      setCalendarRefreshKey(prev => prev + 1);
    }
  };

  const handleJournalCreated = (journal: Journal) => {
    logger.debug(`✅ Journal created successfully, returning to ${lastView}`, {
      journalId: journal.id,
    });
    setCurrentView(lastView);
    // Refresh calendar data to show the new journal entry
    if (lastView === 'calendar') {
      setCalendarRefreshKey(prev => prev + 1);
    }
    // The JournalList component will automatically refresh
  };

  const handleJournalClick = (journal: Journal) => {
    logger.debug('📝 Journal clicked, switching to detail view', {
      journalId: journal.id,
    });
    setSelectedJournal(journal);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    logger.debug('📝 Returning to journal list');
    setCurrentView('list');
    setSelectedJournal(null);
  };

  const handleShowCalendar = () => {
    logger.debug('📅 Switching to calendar view');
    setLastView('list');
    setCurrentView('calendar');
  };

  const handleShowList = () => {
    logger.debug('📝 Switching to list view');
    setLastView('calendar');
    setCurrentView('list');
  };

  const handleCalendarDayClick = async (date: Date) => {
    logger.debug('📅 Calendar day clicked:', { date: date.toISOString() });

    try {
      // Check if there's already a journal for this date
      const existingJournal = await JournalService.getJournalForDate(
        userId,
        date
      );

      if (existingJournal) {
        // If journal exists, show the detail view
        logger.debug(
          '📝 Found existing journal for date, showing detail view',
          {
            journalId: existingJournal.id,
            date: date.toISOString(),
          }
        );
        setSelectedJournal(existingJournal);
        setCurrentView('detail');
      } else {
        // If no journal exists, create a new one for that date
        logger.debug('📝 No journal found for date, creating new entry', {
          date: date.toISOString(),
        });
        setSelectedDate(date);
        setLastView('calendar');
        setCurrentView('create');
      }
    } catch (error) {
      logger.error('❌ Error handling calendar day click:', { error, date });
      // Fallback to list view
      setCurrentView('list');
    }
  };

  const handleViewStats = () => {
    logger.debug('📊 View stats clicked');
    // TODO: Navigate to stats view
    // For now, just show the list view
    setCurrentView('list');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <JournalForm
            userId={userId}
            selectedDate={selectedDate}
            onCancel={handleCancelCreate}
            onSuccess={handleJournalCreated}
            returnToView={lastView}
          />
        );

      case 'detail':
        return selectedJournal ? (
          <JournalDetail journal={selectedJournal} onBack={handleBackToList} />
        ) : null;

      case 'calendar':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Journal Calendar
              </h2>
              <button
                onClick={handleShowList}
                className='rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                View List →
              </button>
            </div>
            <JournalCalendar
              userId={userId}
              onDayClick={handleCalendarDayClick}
              onViewStats={handleViewStats}
              refreshKey={calendarRefreshKey}
            />
          </div>
        );

      case 'list':
      default:
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Your Journal Entries
              </h2>
              <button
                onClick={handleShowCalendar}
                className='rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
              >
                View Calendar →
              </button>
            </div>
            <JournalList
              userId={userId}
              onCreateNew={handleCreateNew}
              onJournalClick={handleJournalClick}
            />
          </div>
        );
    }
  };

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
      {renderContent()}
    </div>
  );
}

// Journal Detail Component
interface JournalDetailProps {
  journal: Journal;
  onBack: () => void;
}

function JournalDetail({ journal, onBack }: JournalDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStressLevelText = (stress: number) => {
    if (stress <= 2) return 'Low';
    if (stress <= 4) return 'Medium';
    if (stress <= 6) return 'Moderate';
    if (stress <= 8) return 'High';
    return 'Very High';
  };

  const getStressLevelColor = (stress: number) => {
    if (stress <= 2) return 'text-green-600 dark:text-green-400';
    if (stress <= 4) return 'text-yellow-600 dark:text-yellow-400';
    if (stress <= 6) return 'text-orange-600 dark:text-orange-400';
    if (stress <= 8) return 'text-red-600 dark:text-red-400';
    return 'text-red-800 dark:text-red-300';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        >
          ← Back to Journal List
        </button>
      </div>

      {/* Journal Content */}
      <div className='rounded-lg bg-white shadow-sm dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-6 dark:border-gray-700'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {journal.title}
              </h1>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                {formatDate(journal.createdAt)} at{' '}
                {formatTime(journal.createdAt)}
              </p>
            </div>
            <div className='text-right'>
              <span
                className={`text-sm font-medium ${getStressLevelColor(journal.stress)}`}
              >
                Stress Level: {getStressLevelText(journal.stress)} (
                {journal.stress}/10)
              </span>
            </div>
          </div>
        </div>

        <div className='space-y-6 p-6'>
          {/* What Went Well */}
          {journal.wentWell && (
            <div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                What went well today
              </h3>
              <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                {journal.wentWell}
              </p>
            </div>
          )}

          {/* What Didn't Go Well */}
          {journal.notWell && (
            <div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                What didn&apos;t go well today
              </h3>
              <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                {journal.notWell}
              </p>
            </div>
          )}

          {/* Goals */}
          {journal.goals && (
            <div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                Goals for tomorrow
              </h3>
              <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                {journal.goals}
              </p>
            </div>
          )}

          {/* Metrics */}
          <div className='border-t border-gray-200 pt-6 dark:border-gray-700'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Daily Metrics
            </h3>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {journal.sleepHours}h
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Sleep
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {journal.activeHours}h
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Active
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {journal.studyHours}h
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Study
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                  {journal.screenTime}h
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Screen Time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
