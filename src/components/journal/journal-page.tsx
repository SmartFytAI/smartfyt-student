'use client';

import { BookOpen, Calendar, Plus, Quote, Loader2, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import { JournalService } from '@/lib/services/journal-service';
import {
  MotivationalQuotesService,
  type MotivationalQuote,
} from '@/lib/services/motivational-quotes-service';
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
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyQuote, setDailyQuote] = useState<MotivationalQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isCheckingTodaysJournal, setIsCheckingTodaysJournal] = useState(false);
  const [todaysJournal, setTodaysJournal] = useState<Journal | null>(null);
  const [journalDates, setJournalDates] = useState<string[]>([]);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  useEffect(() => {
    const loadDailyQuote = async () => {
      try {
        setIsLoadingQuote(true);
        logger.info('📖 Fetching daily motivational quote from API');
        const quote = await MotivationalQuotesService.getDailyQuote();
        setDailyQuote(quote);
      } catch (error) {
        logger.error('❌ Error loading daily quote:', { error });
        setDailyQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const loadJournalDates = async () => {
      try {
        setIsCheckingTodaysJournal(true);
        const dates = await JournalService.getJournalDates(userId);
        setJournalDates(dates);

        // Check if today has a journal using the dates array
        const today = new Date().toISOString().split('T')[0];
        const hasJournalToday = dates.includes(today);

        if (hasJournalToday) {
          // Only load the full journal if we know it exists
          const journal = await JournalService.getJournalForDateEfficient(
            userId,
            new Date()
          );
          setTodaysJournal(journal);
        } else {
          setTodaysJournal(null);
        }

        logger.debug("📅 Today's journal status checked:", {
          hasJournal: hasJournalToday,
          userId,
        });
      } catch (error) {
        logger.error("❌ Error checking today's journal:", { error, userId });
        setTodaysJournal(null);
      } finally {
        setIsCheckingTodaysJournal(false);
      }
    };

    logger.info(
      "📖 Journal page: useEffect triggered, loading daily quote and checking today's journal"
    );
    loadDailyQuote();
    loadJournalDates();
  }, [userId]);

  const handleCreateNew = async () => {
    logger.debug('📝 Handling create new journal request');

    // Check if there's already a journal for today
    if (todaysJournal) {
      logger.debug('📝 Found existing journal for today, showing detail view', {
        journalId: todaysJournal.id,
      });
      setSelectedJournal(todaysJournal);
      setCurrentView('detail');
      // Scroll to top when switching to detail view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      logger.debug('📝 No journal for today, switching to creation view');
      // Set today's date as default when creating a new entry
      setSelectedDate(new Date());
      setCurrentView('create');
    }
  };

  const handleCancelCreate = () => {
    logger.debug('📝 Canceling journal creation, returning to previous view');
    setCurrentView(activeTab as 'calendar' | 'list');
    // Refresh calendar data in case any changes were made
    if (activeTab === 'calendar') {
      setCalendarRefreshKey(prev => prev + 1);
    }
    // Scroll to top when returning to previous view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJournalCreated = (journal: Journal) => {
    logger.debug(
      '✅ Journal created successfully, returning to previous view',
      {
        journalId: journal.id,
      }
    );

    // Update today's journal if this is for today
    const journalDate = new Date(journal.createdAt);
    const today = new Date();
    if (journalDate.toDateString() === today.toDateString()) {
      setTodaysJournal(journal);
    }

    // Add the new date to the journal dates array
    const newDateString = journalDate.toISOString().split('T')[0];
    setJournalDates(prev => [...prev, newDateString]);

    setCurrentView(activeTab as 'calendar' | 'list');
    // Refresh calendar data to show the new journal entry
    if (activeTab === 'calendar') {
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
    // Scroll to top when switching to detail view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    logger.debug('📝 Returning to journal list');
    setCurrentView(activeTab as 'calendar' | 'list');
    setSelectedJournal(null);
    // Scroll to top when returning to list/calendar view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalendarDayClick = async (date: Date) => {
    logger.debug('📅 Calendar day clicked:', { date: date.toISOString() });

    try {
      // Use the journal dates array for fast checking
      const dateString = date.toISOString().split('T')[0];
      const hasJournal = journalDates.includes(dateString);

      logger.debug('📅 Calendar day click - date check:', {
        date: dateString,
        hasJournal,
        journalDatesCount: journalDates.length,
        sampleDates: journalDates.slice(0, 3),
      });

      if (hasJournal) {
        // Only load the full journal if we know it exists
        const existingJournal = await JournalService.getJournalForDateEfficient(
          userId,
          date
        );

        if (existingJournal) {
          logger.debug(
            '📝 Found existing journal for date, showing detail view',
            {
              journalId: existingJournal.id,
              date: date.toISOString(),
            }
          );
          setSelectedJournal(existingJournal);
          setCurrentView('detail');
          // Scroll to top when switching to detail view
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Fallback: journal was deleted but date still in array
          logger.warn(
            '📝 Journal not found but date exists in array, creating new entry',
            {
              date: date.toISOString(),
              dateString,
            }
          );
          // Remove the invalid date from the array
          setJournalDates(prev => prev.filter(d => d !== dateString));
          setSelectedDate(date);
          setCurrentView('create');
        }
      } else {
        // No journal exists for this date, create a new one
        logger.debug('📝 No journal found for date, creating new entry', {
          date: date.toISOString(),
        });
        setSelectedDate(date);
        setCurrentView('create');
      }
    } catch (error) {
      logger.error('❌ Error handling calendar day click:', { error, date });
      // Fallback to list view
      setCurrentView('list');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'calendar' | 'list');
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
            returnToView={activeTab as 'calendar' | 'list'}
          />
        );

      case 'detail':
        return selectedJournal ? (
          <JournalDetail journal={selectedJournal} onBack={handleBackToList} />
        ) : null;

      case 'calendar':
      case 'list':
      default:
        return (
          <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='space-y-6'>
              {/* Journal Overview Section */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-5 w-5 text-blue-500' />
                      <CardTitle>Journal Overview</CardTitle>
                    </div>
                    <Button
                      onClick={handleCreateNew}
                      size='sm'
                      disabled={isCheckingTodaysJournal}
                    >
                      {isCheckingTodaysJournal ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Checking...
                        </>
                      ) : todaysJournal ? (
                        <>
                          <Eye className='mr-2 h-4 w-4' />
                          View Today&apos;s Journal
                        </>
                      ) : (
                        <>
                          <Plus className='mr-2 h-4 w-4' />
                          Today&apos;s Journal
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Track your daily progress and reflect on your journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Motivational Quote */}
                  <div className='mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50'>
                    <div className='flex items-start gap-3'>
                      <Quote className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500 dark:text-orange-400' />
                      <div>
                        {isLoadingQuote ? (
                          <div className='animate-pulse'>
                            <div className='mb-2 h-5 rounded bg-gray-200 dark:bg-gray-700'></div>
                            <div className='h-4 w-20 rounded bg-gray-200 dark:bg-gray-700'></div>
                          </div>
                        ) : dailyQuote ? (
                          <>
                            <p className='text-base font-medium text-gray-900 dark:text-gray-100'>
                              &ldquo;{dailyQuote.quote}&rdquo;
                            </p>
                            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                              - {dailyQuote.author}
                            </p>
                          </>
                        ) : (
                          <p className='text-base font-medium text-gray-900 dark:text-gray-100'>
                            &ldquo;The only way to do great work is to love what
                            you do.&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journal Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className='space-y-4'
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger
                    value='calendar'
                    className='flex items-center gap-2'
                  >
                    <Calendar className='h-4 w-4' />
                    Calendar View
                  </TabsTrigger>
                  <TabsTrigger value='list' className='flex items-center gap-2'>
                    <BookOpen className='h-4 w-4' />
                    List View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='calendar' className='space-y-4'>
                  <JournalCalendar
                    userId={userId}
                    onDayClick={handleCalendarDayClick}
                    onViewStats={handleViewStats}
                    refreshKey={calendarRefreshKey}
                  />
                </TabsContent>

                <TabsContent value='list' className='space-y-4'>
                  <JournalList
                    userId={userId}
                    onJournalClick={handleJournalClick}
                    isActive={activeTab === 'list'}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
    }
  };

  return renderContent();
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
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={onBack}>
            ← Back to Journal
          </Button>
        </div>

        {/* Journal Content */}
        <Card>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='text-2xl'>{journal.title}</CardTitle>
                <CardDescription className='mt-1'>
                  {formatDate(journal.createdAt)} at{' '}
                  {formatTime(journal.createdAt)}
                </CardDescription>
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
          </CardHeader>

          <CardContent className='space-y-6'>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
