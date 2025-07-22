'use client';

import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

interface ApiResponse {
  data?: any;
  error?: string;
  status: number;
  headers?: Record<string, string>;
  duration?: number;
}

interface EndpointConfig {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  bodySchema?: Record<string, any>;
  params?: string[];
}

const API_ENDPOINTS: Record<string, EndpointConfig> = {
  // ┌─────────────────────────────────────────────────────────────┐
  // │                    HEALTH & PUBLIC                         │
  // └─────────────────────────────────────────────────────────────┘
  health: {
    method: 'GET',
    path: '/health',
    description: 'Health check endpoint',
    requiresAuth: false,
  },
  motivationalQuotesDaily: {
    method: 'GET',
    path: '/api/motivational-quotes/daily',
    description: 'Get daily motivational quote',
    requiresAuth: false,
  },
  motivationalQuotesRandom: {
    method: 'GET',
    path: '/api/motivational-quotes/random',
    description: 'Get random motivational quote',
    requiresAuth: false,
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    USER MANAGEMENT                         │
  // └─────────────────────────────────────────────────────────────┘
  createUser: {
    method: 'POST',
    path: '/users',
    description: 'Create a new user',
    requiresAuth: true,
    bodySchema: {
      id: 'string',
      email: 'string',
      firstName: 'string',
      lastName: 'string',
      profileImage: 'string',
      username: 'string',
    },
  },
  getUserData: {
    method: 'GET',
    path: '/users/{userId}/data',
    description: 'Get user data',
    requiresAuth: true,
    params: ['userId'],
  },
  getUserTeams: {
    method: 'GET',
    path: '/users/{userId}/teams',
    description: 'Get user teams',
    requiresAuth: true,
    params: ['userId'],
  },
  getUserSnapshot: {
    method: 'GET',
    path: '/users/{userId}/snapshot',
    description: 'Get user snapshot data',
    requiresAuth: true,
    params: ['userId'],
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    SPORTS & SCHOOLS                        │
  // └─────────────────────────────────────────────────────────────┘
  getSports: {
    method: 'GET',
    path: '/sports',
    description: 'Get all sports',
    requiresAuth: true,
  },
  getSchools: {
    method: 'GET',
    path: '/schools',
    description: 'Get all schools',
    requiresAuth: true,
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                        JOURNALS                            │
  // └─────────────────────────────────────────────────────────────┘
  getJournals: {
    method: 'GET',
    path: '/users/{userId}/journals',
    description: 'Get user journals',
    requiresAuth: true,
    params: ['userId'],
  },
  getJournalDates: {
    method: 'GET',
    path: '/users/{userId}/journals/dates',
    description: 'Get user journal dates',
    requiresAuth: true,
    params: ['userId'],
  },
  getJournalForDate: {
    method: 'GET',
    path: '/users/{userId}/journals/date/{date}',
    description: 'Get journal for specific date',
    requiresAuth: true,
    params: ['userId', 'date'],
  },
  createJournal: {
    method: 'POST',
    path: '/journals',
    description: 'Create a new journal entry',
    requiresAuth: true,
    bodySchema: {
      authorID: 'string',
      title: 'string',
      wentWell: 'string',
      notWell: 'string',
      goals: 'string',
      sleepHours: 'number',
      activeHours: 'number',
      stress: 'number',
      screenTime: 'number',
      studyHours: 'number',
    },
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                         QUESTS                             │
  // └─────────────────────────────────────────────────────────────┘
  getUserQuests: {
    method: 'GET',
    path: '/users/{userId}/quests',
    description: 'Get user quests',
    requiresAuth: true,
    params: ['userId'],
  },
  completeQuest: {
    method: 'POST',
    path: '/quests/complete',
    description: 'Complete a quest',
    requiresAuth: true,
    bodySchema: {
      userId: 'string',
      questId: 'string',
      notes: 'string',
    },
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    DASHBOARD & METRICS                     │
  // └─────────────────────────────────────────────────────────────┘
  getDashboard: {
    method: 'GET',
    path: '/users/{userId}/dashboard',
    description: 'Get user dashboard data',
    requiresAuth: true,
    params: ['userId'],
  },
  getUserMetrics: {
    method: 'GET',
    path: '/users/{userId}/metrics',
    description: 'Get user metrics',
    requiresAuth: true,
    params: ['userId'],
  },
  getHealthData: {
    method: 'GET',
    path: '/users/{userId}/health',
    description: 'Get user health data',
    requiresAuth: true,
    params: ['userId'],
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    LEADERBOARDS                            │
  // └─────────────────────────────────────────────────────────────┘
  getUserTeamsForLeaderboard: {
    method: 'GET',
    path: '/users/{userId}/teams/leaderboard',
    description: 'Get user teams for leaderboard',
    requiresAuth: true,
    params: ['userId'],
  },
  getTeamLeaderboard: {
    method: 'GET',
    path: '/teams/{teamId}/leaderboard',
    description: 'Get team leaderboard',
    requiresAuth: true,
    params: ['teamId'],
  },
  getSchoolLeaderboard: {
    method: 'GET',
    path: '/users/{userId}/school/leaderboard',
    description: 'Get school leaderboard',
    requiresAuth: true,
    params: ['userId'],
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    TEAM MANAGEMENT                         │
  // └─────────────────────────────────────────────────────────────┘
  getAllTeams: {
    method: 'GET',
    path: '/teams',
    description: 'Get all teams (admin/coach view)',
    requiresAuth: true,
  },
  getTeamMembers: {
    method: 'GET',
    path: '/teams/{teamId}/members',
    description: 'Get team members',
    requiresAuth: true,
    params: ['teamId'],
  },
  createTeam: {
    method: 'POST',
    path: '/teams',
    description: 'Create a new team',
    requiresAuth: true,
    bodySchema: {
      name: 'string',
      sportID: 'string',
      schoolID: 'string (optional)',
      creatorId: 'string',
    },
  },
  addUserToTeam: {
    method: 'POST',
    path: '/teams/{teamId}/members',
    description: 'Add user to team',
    requiresAuth: true,
    params: ['teamId'],
    bodySchema: {
      userId: 'string',
      role: 'string (optional, defaults to "member")',
    },
  },
  removeUserFromTeam: {
    method: 'DELETE',
    path: '/teams/{teamId}/members/{userId}',
    description: 'Remove user from team',
    requiresAuth: true,
    params: ['teamId', 'userId'],
  },
  updateUserRole: {
    method: 'PUT',
    path: '/teams/{teamId}/members/{userId}',
    description: 'Update user role in team',
    requiresAuth: true,
    params: ['teamId', 'userId'],
    bodySchema: {
      role: 'string',
    },
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    CONTACT & UPLOAD                        │
  // └─────────────────────────────────────────────────────────────┘
  submitContact: {
    method: 'POST',
    path: '/contact',
    description: 'Submit contact inquiry',
    requiresAuth: false,
    bodySchema: {
      name: 'string',
      email: 'string',
      organization: 'string',
      planType: 'string',
      message: 'string',
    },
  },
  getContactInquiries: {
    method: 'GET',
    path: '/contact',
    description: 'Get all contact inquiries (admin)',
    requiresAuth: false,
  },
  getUploadUrl: {
    method: 'POST',
    path: '/upload/signed-url',
    description: 'Get S3 signed URL for file upload',
    requiresAuth: false,
    bodySchema: {
      fileName: 'string',
      fileType: 'string',
    },
  },

  // ┌─────────────────────────────────────────────────────────────┐
  // │                    DEBUG & TESTING                         │
  // └─────────────────────────────────────────────────────────────┘
  debugS3Test: {
    method: 'GET',
    path: '/debug/s3-test',
    description: 'Test S3 connectivity and system health',
    requiresAuth: false,
  },
  debugStats: {
    method: 'GET',
    path: '/debug/stats',
    description: 'Get system statistics',
    requiresAuth: false,
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ApiTestPage() {
  const { user, getToken } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('health');
  const [requestBody, setRequestBody] = useState<string>('');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');

  useEffect(() => {
    // Auto-fill auth token if user is logged in
    if (user && getToken) {
      const token = getToken();
      if (token) setAuthToken(token);
    }
  }, [user, getToken]);

  // Only show this page in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold text-red-600'>
            Access Denied
          </h1>
          <p className='text-gray-600'>
            This page is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  const makeApiCall = async () => {
    setIsLoading(true);
    setResponse(null);

    const endpoint = API_ENDPOINTS[selectedEndpoint];
    if (!endpoint) return;

    const startTime = Date.now();

    try {
      // Build URL with parameters
      let url = `${API_BASE_URL}${endpoint.path}`;
      if (endpoint.params) {
        endpoint.params.forEach(param => {
          const value = urlParams[param];
          if (value) {
            url = url.replace(`{${param}}`, value);
          }
        });
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (endpoint.requiresAuth && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Prepare request options
      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      // Add body for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && requestBody) {
        try {
          options.body = requestBody;
        } catch (error) {
          logger.error('Invalid JSON in request body:', error);
          setResponse({
            error: 'Invalid JSON in request body',
            status: 400,
            duration: Date.now() - startTime,
          });
          setIsLoading(false);
          return;
        }
      }

      // Make the request
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      let responseData;
      const responseText = await response.text();

      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      setResponse({
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        duration,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have one
      // console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className='api-test-page container mx-auto space-y-6 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>API Testing Console</h1>
          <p className='text-muted-foreground'>
            Test SmartFyt API endpoints in development mode
          </p>
          {user && (
            <div className='mt-2 rounded-lg bg-muted p-3'>
              <p className='text-sm font-medium'>Logged in as:</p>
              <div className='mt-1 flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  ID: {user.id}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => copyToClipboard(user.id)}
                  className='h-6 px-2 text-xs'
                >
                  Copy ID
                </Button>
                <Badge variant='outline' className='text-xs'>
                  {user.email}
                </Badge>
                {user.name && (
                  <Badge variant='outline' className='text-xs'>
                    {user.name}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <Badge variant='outline' className='text-xs'>
          Development Only
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Panel - Endpoint Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint</CardTitle>
            <CardDescription>Select an API endpoint to test</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Select
              value={selectedEndpoint}
              onValueChange={setSelectedEndpoint}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='max-h-96'>
                {/* Health & Public */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  HEALTH & PUBLIC
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'health',
                      'motivationalQuotesDaily',
                      'motivationalQuotesRandom',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* User Management */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  USER MANAGEMENT
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'createUser',
                      'getUserData',
                      'getUserTeams',
                      'getUserSnapshot',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Sports & Schools */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  SPORTS & SCHOOLS
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) => ['getSports', 'getSchools'].includes(key))
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Journals */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  JOURNALS
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'getJournals',
                      'getJournalDates',
                      'getJournalForDate',
                      'createJournal',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Quests */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  QUESTS
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    ['getUserQuests', 'completeQuest'].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Dashboard & Metrics */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  DASHBOARD & METRICS
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'getDashboard',
                      'getUserMetrics',
                      'getHealthData',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Leaderboards */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  LEADERBOARDS
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'getUserTeamsForLeaderboard',
                      'getTeamLeaderboard',
                      'getSchoolLeaderboard',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Team Management */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  TEAM MANAGEMENT
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'getAllTeams',
                      'getTeamMembers',
                      'createTeam',
                      'addUserToTeam',
                      'removeUserFromTeam',
                      'updateUserRole',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Contact & Upload */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  CONTACT & UPLOAD
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    [
                      'submitContact',
                      'getContactInquiries',
                      'getUploadUrl',
                    ].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}

                {/* Debug & Testing */}
                <div className='border-b bg-muted/50 px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                  DEBUG & TESTING
                </div>
                {Object.entries(API_ENDPOINTS)
                  .filter(([key]) =>
                    ['debugS3Test', 'debugStats'].includes(key)
                  )
                  .map(([key, config]) => (
                    <SelectItem key={key} value={key} className='ml-2'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {config.method}
                        </Badge>
                        <span className='truncate'>{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className='text-sm text-muted-foreground'>
              <p>
                <strong>Method:</strong>{' '}
                {API_ENDPOINTS[selectedEndpoint]?.method}
              </p>
              <p>
                <strong>Path:</strong> {API_ENDPOINTS[selectedEndpoint]?.path}
              </p>
              <p>
                <strong>Auth Required:</strong>{' '}
                {API_ENDPOINTS[selectedEndpoint]?.requiresAuth ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Middle Panel - Request Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure your API request</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Tabs defaultValue='params' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='params'>Parameters</TabsTrigger>
                <TabsTrigger value='body'>Body</TabsTrigger>
                <TabsTrigger value='auth'>Auth</TabsTrigger>
              </TabsList>

              <TabsContent value='params' className='space-y-4'>
                {API_ENDPOINTS[selectedEndpoint]?.params?.map(param => (
                  <div key={param} className='space-y-2'>
                    <label className='text-sm font-medium'>{param}</label>
                    <Input
                      placeholder={`Enter ${param}`}
                      value={urlParams[param] || ''}
                      onChange={e =>
                        setUrlParams(prev => ({
                          ...prev,
                          [param]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
                {!API_ENDPOINTS[selectedEndpoint]?.params?.length && (
                  <p className='text-sm text-muted-foreground'>
                    No parameters required for this endpoint
                  </p>
                )}
              </TabsContent>

              <TabsContent value='body' className='space-y-4'>
                {API_ENDPOINTS[selectedEndpoint]?.bodySchema ? (
                  <>
                    <div className='text-sm text-muted-foreground'>
                      <p>
                        <strong>Expected Schema:</strong>
                      </p>
                      <pre className='mt-2 rounded bg-muted p-2 text-xs'>
                        {formatJson(
                          API_ENDPOINTS[selectedEndpoint]?.bodySchema
                        )}
                      </pre>
                    </div>
                    <Textarea
                      placeholder='Enter JSON request body...'
                      value={requestBody}
                      onChange={e => setRequestBody(e.target.value)}
                      rows={8}
                      className='select-text'
                    />
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No request body required for this endpoint
                  </p>
                )}
              </TabsContent>

              <TabsContent value='auth' className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>JWT Token</label>
                  <Textarea
                    placeholder='Enter your JWT token...'
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                    rows={4}
                    className='select-text'
                  />
                  {user && (
                    <p className='text-xs text-muted-foreground'>
                      Logged in as: {user.email}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={makeApiCall}
              disabled={isLoading}
              className='w-full'
            >
              {isLoading ? 'Sending Request...' : 'Send Request'}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Response */}
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>View API response</CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Badge className={getStatusColor(response.status)}>
                    {response.status}
                  </Badge>
                  {response.duration && (
                    <Badge variant='outline'>{response.duration}ms</Badge>
                  )}
                </div>

                <Tabs defaultValue='data' className='w-full'>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='data'>Data</TabsTrigger>
                    <TabsTrigger value='headers'>Headers</TabsTrigger>
                  </TabsList>
                  <div className='mt-2 flex justify-end'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        copyToClipboard(
                          response.error
                            ? response.error
                            : formatJson(response.data)
                        )
                      }
                    >
                      Copy Response
                    </Button>
                  </div>

                  <TabsContent value='data'>
                    <div className='h-64 w-full overflow-auto'>
                      <pre className='select-text rounded bg-muted p-4 text-xs'>
                        {response.error
                          ? response.error
                          : formatJson(response.data)}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value='headers'>
                    <div className='h-64 w-full overflow-auto'>
                      <pre className='select-text rounded bg-muted p-4 text-xs'>
                        {formatJson(response.headers)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Send a request to see the response here
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common testing scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('health');
                setRequestBody('');
                setUrlParams({});
              }}
            >
              Test Health
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('createUser');
                setRequestBody(
                  JSON.stringify(
                    {
                      id: `test-user-${Date.now()}`,
                      email: `test-${Date.now()}@example.com`,
                      firstName: 'Test',
                      lastName: 'User',
                      profileImage: 'https://example.com/avatar.jpg',
                      username: `testuser${Date.now()}`,
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Create Test User
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getUserData');
                setUrlParams({ userId: user?.id || 'test-user-123' });
              }}
            >
              Get My User Data
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getUserData');
                setUrlParams({ userId: 'test-user-123' });
              }}
            >
              Get Test User Data
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('createJournal');
                setRequestBody(
                  JSON.stringify(
                    {
                      authorID: user?.id || 'test-user-123',
                      title: 'Test Journal Entry',
                      wentWell: 'Had a great workout',
                      notWell: 'Could have slept better',
                      goals: 'Improve sleep quality',
                      sleepHours: 7,
                      activeHours: 2,
                      stress: 3,
                      screenTime: 4,
                      studyHours: 3,
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Create My Journal
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('createJournal');
                setRequestBody(
                  JSON.stringify(
                    {
                      authorID: 'test-user-123',
                      title: 'Test Journal Entry',
                      wentWell: 'Had a great workout',
                      notWell: 'Could have slept better',
                      goals: 'Improve sleep quality',
                      sleepHours: 7,
                      activeHours: 2,
                      stress: 3,
                      screenTime: 4,
                      studyHours: 3,
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Create Test Journal
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('motivationalQuotesDaily');
                setRequestBody('');
                setUrlParams({});
              }}
            >
              Get Daily Quote
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('motivationalQuotesRandom');
                setRequestBody('');
                setUrlParams({});
              }}
            >
              Get Random Quote
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getUserTeams');
                setUrlParams({ userId: user?.id || 'test-user-123' });
              }}
            >
              Get My Teams
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getDashboard');
                setUrlParams({ userId: user?.id || 'test-user-123' });
              }}
            >
              Get My Dashboard
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getAllTeams');
                setRequestBody('');
                setUrlParams({});
              }}
            >
              Get All Teams
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('createTeam');
                setRequestBody(
                  JSON.stringify(
                    {
                      name: 'Test Team',
                      sportID: '1', // You'll need to get a real sport ID
                      creatorId: user?.id || 'test-user-123',
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Create Test Team
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('addUserToTeam');
                setUrlParams({ teamId: 'test-team-id' });
                setRequestBody(
                  JSON.stringify(
                    {
                      userId: user?.id || 'test-user-123',
                      role: 'member',
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Add User to Team
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('submitContact');
                setRequestBody(
                  JSON.stringify(
                    {
                      name: 'Test User',
                      email: 'test@example.com',
                      organization: 'Test Org',
                      planType: 'Basic',
                      message: 'This is a test contact inquiry',
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Submit Contact
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('getUploadUrl');
                setRequestBody(
                  JSON.stringify(
                    {
                      fileName: 'test-audio.wav',
                      fileType: 'audio/wav',
                    },
                    null,
                    2
                  )
                );
              }}
            >
              Get Upload URL
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSelectedEndpoint('debugS3Test');
                setRequestBody('');
                setUrlParams({});
              }}
            >
              Debug Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
