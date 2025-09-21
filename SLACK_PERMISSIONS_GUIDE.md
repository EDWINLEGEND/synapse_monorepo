# Slack Bot Permissions Setup Guide

## Overview
To resolve the 500 Internal Server Error during Slack sync, you need to update your Slack Bot's permissions to include the required scopes for reading channel history.

## Required Scopes
Your Slack Bot Token needs the following OAuth scopes:

### Bot Token Scopes (Required)
- `channels:history` - Read messages and other content in public channels
- `groups:history` - Read messages and other content in private channels  
- `mpim:history` - Read messages and other content in group direct messages
- `im:history` - Read messages and other content in direct messages

### Additional Recommended Scopes
- `channels:read` - View basic information about public channels
- `groups:read` - View basic information about private channels
- `users:read` - View people in the workspace

## Setup Instructions

### Step 1: Access Slack API Dashboard
1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Sign in to your Slack account
3. Select your Synapse application from the list

### Step 2: Update OAuth Scopes
1. In the left sidebar, navigate to **"OAuth & Permissions"**
2. Scroll down to the **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"**
4. Add each of the required scopes listed above:
   - `channels:history`
   - `groups:history` 
   - `mpim:history`
   - `im:history`

### Step 3: Reinstall the App
1. After adding the scopes, a banner will appear at the top of the page
2. Click **"Reinstall your app"** in the banner
3. Review the permissions and click **"Allow"** to approve the changes
4. **Important**: This step is required to activate the new permissions

### Step 4: Verify Token
1. Copy your Bot User OAuth Token from the OAuth & Permissions page
2. Update your `.env` file with the token:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```

## Testing the Fix
After updating permissions and restarting your server:

1. Make a POST request to `/api/sync/slack` with valid channel IDs
2. The request should now complete successfully with a 200 OK status
3. Check server logs - you should see no `missing_scope` or `NameError` messages

## Common Issues

### Permission Denied Errors
- Ensure you've clicked "Reinstall your app" after adding scopes
- Verify the bot has been added to the channels you're trying to sync

### Invalid Channel IDs
- Channel IDs should start with 'C' (e.g., C1234567890)
- You can find channel IDs in the Slack URL or using the Slack API

### Token Issues
- Make sure you're using the Bot User OAuth Token, not the User OAuth Token
- Verify the token is correctly set in your environment variables

## Error Messages Resolved
This setup resolves these specific errors:
- `{'error': 'missing_scope', 'needed': 'channels:history...'}`
- `Error syncing Slack: name 'json' is not defined`