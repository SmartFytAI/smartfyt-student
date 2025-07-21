# API Testing Guide

## Overview

The SmartFyt Student app includes a comprehensive API testing interface that's only available in development mode. This allows you to test all API endpoints directly from the browser without needing external tools like Postman.

## Accessing the API Test Page

1. **Development Mode Only**: The API test page is only available when `NODE_ENV=development`
2. **Navigation**: In development mode, you'll see an "API Test" tab in the bottom navigation
3. **Direct URL**: Navigate to `/api-test` in your browser

## Features

### 1. Endpoint Selection
- Dropdown menu with all available API endpoints
- Shows HTTP method, path, and description for each endpoint
- Indicates whether authentication is required

### 2. Request Configuration
Three tabs for configuring your request:

#### Parameters Tab
- For endpoints that require URL parameters (e.g., `{userId}`)
- Input fields are dynamically generated based on the endpoint

#### Body Tab
- For POST/PUT requests that require a request body
- Shows the expected JSON schema
- JSON editor with syntax highlighting

#### Auth Tab
- JWT token input field
- Auto-fills with the current user's token if logged in
- Shows current user email for reference

### 3. Response Display
- Real-time response status and timing
- Formatted JSON response data
- Response headers
- Error handling and display

### 4. Quick Actions
Pre-configured buttons for common testing scenarios:
- **Test Health**: Quick health check
- **Create Test User**: Creates a test user with timestamped data
- **Get User Data**: Retrieves user data (requires userId)
- **Create Journal**: Creates a test journal entry

## Available Endpoints

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `GET /api/motivational-quotes/daily` - Get daily motivational quote
- `GET /api/motivational-quotes/random` - Get random motivational quote

### User Management
- `POST /users` - Create a new user
- `GET /users/{userId}/data` - Get user data
- `GET /users/{userId}/teams` - Get user teams
- `GET /users/{userId}/snapshot` - Get user snapshot

### Sports & Schools
- `GET /sports` - Get all sports
- `GET /schools` - Get all schools

### Journals
- `GET /users/{userId}/journals` - Get user journals
- `GET /users/{userId}/journals/dates` - Get user journal dates
- `GET /users/{userId}/journals/date/{date}` - Get journal for specific date
- `POST /journals` - Create a new journal entry

### Quests
- `GET /users/{userId}/quests` - Get user quests
- `POST /quests/complete` - Complete a quest

### Dashboard & Metrics
- `GET /users/{userId}/dashboard` - Get user dashboard data
- `GET /users/{userId}/metrics` - Get user metrics
- `GET /users/{userId}/health` - Get user health data

### Teams & Leaderboards
- `GET /users/{userId}/teams/leaderboard` - Get user teams for leaderboard
- `GET /teams/{teamId}/leaderboard` - Get team leaderboard
- `GET /users/{userId}/school/leaderboard` - Get school leaderboard

### Team Management
- `GET /teams` - Get all teams (admin/coach view)
- `GET /teams/{teamId}/members` - Get team members
- `POST /teams` - Create a new team
- `POST /teams/{teamId}/members` - Add user to team
- `DELETE /teams/{teamId}/members/{userId}` - Remove user from team
- `PUT /teams/{teamId}/members/{userId}` - Update user role in team

### Contact & Upload
- `POST /contact` - Submit contact inquiry
- `GET /contact` - Get all contact inquiries (admin)
- `POST /upload/signed-url` - Get S3 signed URL for file upload

### Debug & Testing
- `GET /debug/s3-test` - Test S3 connectivity and system health
- `GET /debug/stats` - Get system statistics

## Getting Started

### 1. Start Your API Server
```bash
cd smartfyt-api
flox activate -- npm run dev
```

### 2. Start Your Frontend
```bash
cd smartfyt-student
flox activate -- npm run dev
```

### 3. Get Authentication Token
1. Log in to your app through the normal login flow
2. The API test page will automatically detect and use your JWT token
3. Alternatively, you can manually paste a token in the Auth tab

### 4. Test Endpoints
1. Select an endpoint from the dropdown
2. Configure parameters, body, and auth as needed
3. Click "Send Request"
4. View the response in the right panel

## Example Workflows

### Creating and Testing a User
1. Use "Create Test User" quick action
2. Copy the generated user ID from the response
3. Use "Get User Data" quick action with the copied ID
4. Test other user-related endpoints

### Testing Journal Functionality
1. Create a user first
2. Use "Create Journal" quick action
3. Modify the request body as needed
4. Test journal retrieval endpoints

### Testing Team Features
1. Create a user
2. Use the user ID to test team-related endpoints
3. Test leaderboard functionality

### Testing Team Management
1. **Get All Teams**: Use "Get All Teams" quick action to see existing teams
2. **Create Team**: Use "Create Test Team" quick action (you'll need a valid sport ID)
3. **Add User to Team**: Use "Add User to Team" with a valid team ID and user ID
4. **Get Team Members**: Test with a team ID to see all members
5. **Update User Role**: Change a user's role from 'member' to 'coach' or vice versa
6. **Remove User**: Remove a user from a team (use with caution!)

### Testing Contact & Upload
1. **Submit Contact**: Use "Submit Contact" quick action to test contact form
2. **Get Contact Inquiries**: View all submitted contact inquiries
3. **Get Upload URL**: Use "Get Upload URL" to test S3 signed URL generation

### Testing Debug & System
1. **Debug Test**: Use "Debug Test" quick action to check system health
2. **System Stats**: Get comprehensive system statistics

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check that you have a valid JWT token
   - Ensure the token hasn't expired
   - Verify the token is properly formatted

2. **404 Not Found**
   - Check that your API server is running
   - Verify the endpoint path is correct
   - Ensure URL parameters are properly set

3. **400 Bad Request**
   - Check the request body JSON format
   - Verify all required fields are present
   - Check parameter types (string vs number)

4. **500 Internal Server Error**
   - Check your API server logs
   - Verify database connectivity
   - Check for missing environment variables

### Debug Tips

1. **Check Response Headers**: Look at the response headers tab for additional error information
2. **Use Browser Dev Tools**: Check the Network tab for detailed request/response information
3. **API Server Logs**: Monitor your API server console for detailed error messages
4. **Database State**: Use Prisma Studio to check database state if needed

## Security Notes

- This testing interface is **only available in development mode**
- Never commit this page to production
- Be careful with sensitive data in request bodies
- Consider using test data instead of real user data when possible

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

The API test page will automatically use the `NEXT_PUBLIC_API_URL` for making requests. 