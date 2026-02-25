# 🔍 Debug Guide for Email Verification

## **Current Issues & Solutions**

### **Issue 1: Email Not Sending**
**Problem:** You see verification codes in terminal but not in email

**Solution: Configure Gmail**
1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for app
   - Generate 16-character password
3. **Update .env file:**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### **Issue 2: Not Redirecting to Dashboard**
**Problem:** Verification succeeds but no redirect

**Debug Steps:**
1. **Open Browser Console:** F12 → Console tab
2. **Try registration and verification**
3. **Look for these logs:**
   - 🔍 Verification started
   - 📧 Verification code entered: [your-code]
   - 📦 Temp data from localStorage: [should show data]
   - ✅ Verification response received: [should show success]
   - 🎉 Showing success modal with business code: [should show code]

### **Common Console Errors & Solutions**

**Error:** "No temp data found in localStorage"
- **Cause:** Registration step failed
- **Fix:** Check registration submission errors

**Error:** "Invalid or expired verification code"
- **Cause:** Code not found in database
- **Fix:** Check backend logs for verification lookup

**Error:** Network error
- **Cause:** Backend not running or CORS issue
- **Fix:** Ensure backend running on port 5000

## **Testing Steps**

1. **Start Backend:** `npm run dev`
2. **Start Frontend:** `npm start`
3. **Clear Browser:** F12 → Application → Storage → Clear
4. **Register Business:** Fill form and submit
5. **Check Console:** Look for verification code in backend terminal
6. **Enter Code:** Use code from terminal
7. **Monitor Console:** Watch all debug logs

## **What to Share for Help**

If still not working, share:
1. **Browser Console logs** (F12 → Console → Screenshot)
2. **Backend terminal logs** (Copy all output)
3. **Network tab errors** (F12 → Network → Failed requests)

## **Quick Email Test**

Test email configuration:
```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'your-test-email@gmail.com',
  subject: 'Test',
  text: 'Test email'
}).then(console.log).catch(console.error);
"
```
