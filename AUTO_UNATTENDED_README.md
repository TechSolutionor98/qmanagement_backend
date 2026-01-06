# Auto-Unattended Tickets Feature

## Overview
This feature automatically marks tickets as "Unattended" after midnight based on each admin's timezone. This ensures that tickets from previous days that are still in "Pending" or "Called" status are properly marked as unattended.

## How It Works

### 1. **Timezone-Aware Processing**
- Each admin has their own timezone setting (e.g., `+05:00` for PKT, `+04:00` for GST)
- The system checks tickets based on each admin's local timezone
- Midnight is calculated in the admin's timezone, not server time

### 2. **Automatic Scheduling**
- A cron job runs **every hour** to check for unattended tickets
- Cron expression: `0 * * * *` (runs at the start of every hour)
- The task processes all admins and their tickets independently

### 3. **Ticket Selection Criteria**
Tickets are marked as "Unattended" when:
- Status is **"Pending"** OR **"Called"**
- Ticket date is **before today** (in admin's timezone)
- Ticket belongs to the specific admin

### 4. **What Gets Updated**
When a ticket is marked as unattended:
- `status` is set to **"Unattended"**
- `status_time` is updated to current time in admin's timezone
- `last_updated` timestamp is updated

## Files Modified/Created

### New Files:
1. **`backend/controllers/tickets/autoUnattendedTickets.js`**
   - Main controller with auto-mark logic
   - Exports `autoMarkUnattendedTickets()` for cron
   - Exports `triggerAutoUnattended()` for manual testing

2. **`backend/scripts/test-auto-unattended.js`**
   - Test script to verify functionality
   - Shows before/after ticket states
   - Run with: `node backend/scripts/test-auto-unattended.js`

3. **`backend/migrations/add-admin-id-to-tickets.js`**
   - Migration to add `admin_id` column to tickets table
   - Ensures database schema is up to date

### Modified Files:
1. **`backend/server.js`**
   - Added `node-cron` import
   - Added cron job that runs every hour
   - Configured to run `autoMarkUnattendedTickets()` automatically

2. **`backend/controllers/tickets/index.js`**
   - Exported `triggerAutoUnattended` function

3. **`backend/routes/tickets.js`**
   - Added `/api/tickets/trigger-auto-unattended` route (super_admin only)
   - For manual testing

4. **`backend/package.json`**
   - Added `node-cron` dependency

## Usage

### Automatic Mode (Production)
The feature works automatically once the server is running. No manual intervention needed.

### Manual Testing

#### Method 1: Using API Endpoint
```bash
POST http://localhost:5000/api/tickets/trigger-auto-unattended
Authorization: Bearer <super_admin_token>
```

#### Method 2: Using Test Script
```bash
cd backend
node scripts/test-auto-unattended.js
```

## Configuration

### Adjust Cron Schedule
Edit `backend/server.js` to change the schedule:

```javascript
// Current: Runs every hour
cron.schedule('0 * * * *', async () => {
  await autoMarkUnattendedTickets();
});

// Run every 30 minutes:
cron.schedule('*/30 * * * *', async () => {
  await autoMarkUnattendedTickets();
});

// Run daily at 1 AM:
cron.schedule('0 1 * * *', async () => {
  await autoMarkUnattendedTickets();
});
```

### Cron Expression Guide
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 or 7 = Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

## Database Requirements

### Required Column: `admin_id` in `tickets` table
Run the migration if not already present:
```bash
node backend/migrations/add-admin-id-to-tickets.js
```

Or manually add:
```sql
ALTER TABLE tickets 
ADD COLUMN admin_id INT(11) DEFAULT NULL AFTER id,
ADD KEY idx_tickets_admin_id (admin_id),
ADD CONSTRAINT fk_tickets_admin FOREIGN KEY (admin_id) 
  REFERENCES admin(id) ON DELETE SET NULL;
```

## Logging

The feature logs detailed information:
```
🕐 [autoMarkUnattendedTickets] Running scheduled task...
📋 [autoMarkUnattendedTickets] Admin ID: 12, Timezone: +05:00
   Current time in admin's timezone: 2026-01-06 14:30:00
   Current date in admin's timezone: 2026-01-06
   Found 3 tickets from previous days to mark as Unattended
   ✅ Updated 3 tickets to Unattended
   Tickets: G-105, E-303, L-504
🎯 [autoMarkUnattendedTickets] Task completed. Total tickets updated: 3
```

## Security

- Only **super_admin** can manually trigger the task via API
- Task runs automatically without requiring authentication
- Each admin's data is isolated (multi-tenant safe)

## Troubleshooting

### No tickets are being updated
1. Check if `admin_id` column exists in tickets table
2. Verify admin has a timezone set in the database
3. Check if tickets have `admin_id` populated
4. Verify cron job is running (check server logs)

### Timezone issues
1. Ensure admin timezone is in format: `+05:00` or `-08:00`
2. Check `timezoneHelper.js` is working correctly
3. Verify database stores dates in admin's timezone

### Manual trigger
```bash
# Using curl
curl -X POST http://localhost:5000/api/tickets/trigger-auto-unattended \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"

# Response
{
  "success": true,
  "totalUpdated": 5
}
```

## Future Enhancements

Possible improvements:
1. Add email notifications when tickets are marked unattended
2. Create a dashboard showing unattended ticket statistics
3. Allow admins to configure custom "unattended" threshold (e.g., 2 days instead of 1)
4. Add webhook support for external integrations

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Run the test script to verify functionality
3. Ensure all migrations are applied
4. Verify node-cron is installed: `npm list node-cron`
