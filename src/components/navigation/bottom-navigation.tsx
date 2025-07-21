'use client';

import { Home, BookOpen, Target, MessageSquare, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home, route: '/dashboard' },
  { id: 'journal', label: 'Journal', icon: BookOpen, route: '/journal' },
  { id: 'quests', label: 'Quests', icon: Target, route: '/quests' },
  { id: 'coaching', label: 'Coach', icon: MessageSquare, route: '/coaching' },
  { id: 'team', label: 'Team', icon: Users, route: '/team' },
];

interface BottomNavigationProps {
  className?: string;
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <nav
      className={cn(
        'safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      <div className='flex items-center justify-around px-2 py-2'>
        {navigationItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.route);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className={cn(
                'mx-1 flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-2 py-2 transition-all duration-200',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                active && 'bg-primary-50 dark:bg-primary-900/20'
              )}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon
                className={cn(
                  'mb-1 h-6 w-6 transition-colors duration-200',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
