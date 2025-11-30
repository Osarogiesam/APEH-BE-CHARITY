# 🚀 Quick Start Guide - APEH-BE-CHARITY

## ⚡ Fast Setup (3 Steps)

### Step 1: Start Backend Server

**Option A: Using the startup script (Easiest)**
- Double-click `START_BACKEND.bat` (Windows)
- Or run `START_BACKEND.ps1` in PowerShell

**Option B: Manual start**
```bash
# Navigate to the project folder
cd "C:\Users\celler\Documents\500 materials\1st semster\PROJECT\ngo website\api"

# Install dependencies (first time only)
npm install

# Start server
npm start
```

You should see:
```
🚀 APEH-BE-CHARITY API Server running on port 3000
```

### Step 2: Verify Backend is Running

Open your browser and visit:
```
http://localhost:3000/health
```

You should see:
```json
{"status":"ok","message":"APEH-BE-CHARITY API is running"}
```

### Step 3: Open Frontend

- Open `index.html` in your browser
- Or use Live Server extension in VS Code
- Or use any local web server

## 🧪 Test Payment

1. Go to `donate.html`
2. Fill in the form:
   - Amount: 1000 (or any amount ≥ ₦100)
   - Select a project
   - Select payment method (Flutterwave or Paystack)
   - Fill in your details
3. Click the payment button (NOT the "Send" button)
4. You'll be redirected to the payment gateway

## ❌ Troubleshooting

### Backend won't start?

**Error: "Cannot find module"**
```bash
cd api
npm install
```

**Error: "Port 3000 already in use"**
- Close other applications using port 3000
- Or change PORT in `api/.env`

**Error: "MongoDB connection failed"**
- Install MongoDB locally, OR
- Use MongoDB Atlas (free cloud database)
- Update `MONGODB_URI` in `api/.env`

### Payment not working?

1. **Check backend is running:**
   - Visit `http://localhost:3000/health`
   - Should return `{"status":"ok"}`

2. **Check browser console (F12):**
   - Look for errors
   - Check Network tab for failed requests

3. **Check API URL:**
   - In `js/payments.js`, line 8
   - Should be: `const API_BASE_URL = 'http://localhost:3000/api';`

4. **Make sure you:**
   - Fill ALL required fields
   - Select a payment method
   - Click the PAYMENT BUTTON (not "Send")

## 📝 Important Notes

- **Backend must be running** for payments to work
- **MongoDB must be running** (or use MongoDB Atlas)
- **Use the payment button**, not the form submit button
- **Test mode**: Currently using test API keys (safe for testing)

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to initialize payment" | Backend not running - start it! |
| "Network error" | Check backend URL in payments.js |
| "CORS error" | Backend CORS settings - check FRONTEND_URL in .env |
| Payment button doesn't appear | Select payment method first |
| Form submits instead of payment | Click payment button, not "Send" |

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify backend is running: `http://localhost:3000/health`
4. Check all files are saved

---

**Ready to test?** Start the backend and try a donation! 🎉




