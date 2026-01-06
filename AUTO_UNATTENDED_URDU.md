# Auto-Unattended Tickets Feature - Urdu Documentation
# خودکار طور پر Unattended ٹکٹ کی خصوصیت

## خلاصہ (Summary)
یہ خصوصیت خودکار طور پر رات 12 بجے کے بعد ان ٹکٹوں کو "Unattended" کے طور پر نشان زد کرتی ہے جو "Pending" یا "Called" حالت میں ہیں۔ ہر admin کے اپنے timezone کو مدنظر رکھا جاتا ہے۔

This feature automatically marks tickets as "Unattended" after midnight (12 AM) if they are in "Pending" or "Called" status. Each admin's timezone is respected.

## کیسے کام کرتا ہے (How It Works)

### 1. **Timezone کی بنیاد پر (Timezone-Based)**
- ہر admin کا اپنا timezone ہے (مثال: PKT = +05:00, GST = +04:00)
- سسٹم ہر admin کے local timezone میں ٹکٹوں کو چیک کرتا ہے
- رات 12 بجے کا حساب admin کے timezone میں ہوتا ہے، server time میں نہیں

Each admin has their own timezone. The system checks tickets in each admin's local timezone, not server time.

### 2. **خودکار شیڈول (Automatic Schedule)**
- ہر گھنٹے کے شروع میں یہ task چلتا ہے
- Cron expression: `0 * * * *` (ہر گھنٹے)
- تمام admins کے ٹکٹ الگ الگ process ہوتے ہیں

Runs every hour to check all admins' tickets independently.

### 3. **کون سے ٹکٹ Unattended ہوں گے (Which Tickets)**
ٹکٹ "Unattended" بنتے ہیں جب:
- Status **"Pending"** یا **"Called"** ہو
- ٹکٹ کی تاریخ **آج سے پہلے** ہو (admin کے timezone میں)
- ٹکٹ اس admin کا ہو

Tickets become "Unattended" when:
- Status is "Pending" OR "Called"
- Ticket date is before today (in admin's timezone)
- Ticket belongs to that admin

## مثال (Example)

### Scenario:
**Admin Timezone:** +05:00 (Pakistan Time)  
**آج کی تاریخ:** 6 جنوری 2026  
**موجودہ وقت:** 2:00 AM (رات 2 بجے)

**ٹکٹس:**
1. ✅ Ticket G-105 - تاریخ: 5 جنوری 2026, Status: Pending → **Unattended بن جائے گا**
2. ✅ Ticket E-303 - تاریخ: 4 جنوری 2026, Status: Called → **Unattended بن جائے گا**
3. ❌ Ticket L-504 - تاریخ: 6 جنوری 2026, Status: Pending → **نہیں بدلے گا** (آج کا ہے)
4. ❌ Ticket S-401 - تاریخ: 5 جنوری 2026, Status: Solved → **نہیں بدلے گا** (پہلے سے solved ہے)

## نئی فائلیں (New Files Created)

### 1. **Controller:**
```
backend/controllers/tickets/autoUnattendedTickets.js
```
- مرکزی logic یہاں ہے
- خودکار طور پر ٹکٹ update کرتا ہے

### 2. **Test Script:**
```
backend/scripts/test-auto-unattended.js
```
- Testing کے لیے استعمال کریں
- چلانے کا طریقہ:
```bash
node backend/scripts/test-auto-unattended.js
```

### 3. **Migration:**
```
backend/migrations/add-admin-id-to-tickets.js
```
- Database میں admin_id column شامل کرتا ہے
- چلانے کا طریقہ:
```bash
node backend/migrations/add-admin-id-to-tickets.js
```

### 4. **Documentation:**
```
backend/AUTO_UNATTENDED_README.md
```
- مکمل تفصیلی دستاویز

## استعمال (Usage)

### خودکار (Automatic - Production):
بس server چلائیں، باقی سب خودکار ہو جائے گا۔

Just run the server, everything else is automatic.

```bash
cd backend
npm start
```

### دستی ٹیسٹ (Manual Testing):

#### طریقہ 1: API کے ذریعے
```bash
POST http://localhost:5000/api/tickets/trigger-auto-unattended
```
(صرف super_admin کر سکتا ہے / Only super_admin)

#### طریقہ 2: Test Script
```bash
node backend/scripts/test-auto-unattended.js
```

## ترتیب تبدیل کرنا (Configuration)

### Schedule تبدیل کریں (Change Schedule):

`backend/server.js` میں یہ حصہ تبدیل کریں:

```javascript
// موجودہ: ہر گھنٹے (Current: Every hour)
cron.schedule('0 * * * *', async () => {
  await autoMarkUnattendedTickets();
});

// ہر 30 منٹ میں (Every 30 minutes):
cron.schedule('*/30 * * * *', async () => {
  await autoMarkUnattendedTickets();
});

// روزانہ صبح 1 بجے (Daily at 1 AM):
cron.schedule('0 1 * * *', async () => {
  await autoMarkUnattendedTickets();
});
```

## Database کی ضرورت (Database Requirement)

### ضروری Column: `admin_id` in `tickets` table

Migration چلائیں:
```bash
node backend/migrations/add-admin-id-to-tickets.js
```

یا SQL سے manually:
```sql
ALTER TABLE tickets 
ADD COLUMN admin_id INT(11) DEFAULT NULL;
```

## Logs دیکھنا (View Logs)

جب server چلے گا، آپ کو یہ logs نظر آئیں گے:

```
🕐 [autoMarkUnattendedTickets] Running scheduled task...
📋 Admin ID: 12, Timezone: +05:00
   Current time: 2026-01-06 14:30:00
   Found 3 tickets to mark as Unattended
   ✅ Updated 3 tickets to Unattended
   Tickets: G-105, E-303, L-504
```

## مسائل کا حل (Troubleshooting)

### کوئی ticket update نہیں ہو رہا:
1. ✅ Check: `admin_id` column tickets table میں ہے؟
2. ✅ Check: Admin کا timezone set ہے؟
3. ✅ Check: Tickets میں admin_id موجود ہے؟
4. ✅ Check: Server logs دیکھیں

### دستی طور پر چلائیں (Manual Trigger):
```bash
# Test script
node backend/scripts/test-auto-unattended.js

# یا API
curl -X POST http://localhost:5000/api/tickets/trigger-auto-unattended \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## اہم نکات (Important Points)

✅ **Timezone Aware:** ہر admin کا timezone الگ ہو سکتا ہے  
✅ **Automatic:** کوئی manual کام نہیں چاہیے  
✅ **Safe:** صرف پرانے دن کے tickets بدلتے ہیں  
✅ **Logged:** تمام changes log ہوتے ہیں  
✅ **Multi-tenant:** ہر admin کا data الگ رہتا ہے  

## فوائد (Benefits)

1. **Automatic Management:** پرانے tickets خودکار طور پر unattended ہو جاتے ہیں
2. **Timezone Support:** ہر admin کے local time کے مطابق
3. **Clean Reports:** صحیح statistics اور reports
4. **No Manual Work:** روزانہ manually tickets mark کرنے کی ضرورت نہیں

## مزید معلومات (More Information)

تفصیلی English documentation:
```
backend/AUTO_UNATTENDED_README.md
```

## Summary (خلاصہ)

یہ feature خودکار طور پر:
- ✅ ہر گھنٹے چلتا ہے
- ✅ تمام admins کے tickets چیک کرتا ہے
- ✅ ہر admin کے timezone کو respect کرتا ہے
- ✅ پرانے دن کے Pending/Called tickets کو Unattended کر دیتا ہے
- ✅ آج کے tickets کو نہیں چھیڑتا

This feature automatically:
- ✅ Runs every hour
- ✅ Checks all admins' tickets
- ✅ Respects each admin's timezone
- ✅ Marks old Pending/Called tickets as Unattended
- ✅ Does not touch today's tickets

---

**نوٹ:** اگر کوئی مسئلہ ہو تو backend logs ضرور دیکھیں!
**Note:** If any issue, please check backend logs!
