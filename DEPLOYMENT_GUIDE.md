# APEH-BE-CHARITY Website - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Backend API Setup](#backend-api-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Free Hosting Options](#free-hosting-options)
7. [Deployment Steps](#deployment-steps)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- Node.js (v16 or higher) installed
- MongoDB database (local or cloud)
- API keys from:
  - Flutterwave
  - Paystack
  - Brevo (Sendinblue)
- A code editor (VS Code recommended)
- Git (for version control)

---

## Local Development Setup

### 1. Clone/Download the Project
```bash
cd "C:\Users\celler\Documents\500 materials\1st semster\PROJECT\ngo website"
```

### 2. Install Backend Dependencies
```bash
cd api
npm install
```

### 3. Set Up Environment Variables
1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` file and add your API keys:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
BACKEND_URL=http://localhost:3000
ORG_EMAIL=osarogiesam@gmail.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/apeh-charity

# Flutterwave (Already configured)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-5b3698877619a238fe7db400278fe87b-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-1f76e2a61ae6a183239ddd7787a59174-X
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TEST1cd36ef36080

# Paystack (Already configured)
PAYSTACK_PUBLIC_KEY=pk_test_b1698818dbc9f87189f44c241664e21b8b56c7ad
PAYSTACK_SECRET_KEY=sk_test_23a8d2859bec3ae435ccc154a0e5cf9c5951183b

# Brevo (Already configured)
BREVO_API_KEY=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
```

### 4. Update Frontend API URL
In all JavaScript files, update the API_BASE_URL:
- `js/payments.js` - Line 7
- `js/contact.js` - Line 5
- `js/volunteer.js` - Line 30
- `js/newsletter.js` - Line 5

Change from:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

To your production URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

---

## Backend API Setup

### 1. Start MongoDB
**Option A: Local MongoDB**
```bash
# Windows
mongod

# Or if MongoDB is installed as a service, it should start automatically
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apeh-charity
```

### 2. Start the Backend Server
```bash
cd api
npm start
# Or for development with auto-reload:
npm run dev
```

The server should start on `http://localhost:3000`

### 3. Test the API
Open your browser and visit:
```
http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "environment": "development",
  "message": "APEH-BE-CHARITY API is running"
}
```

---

## Database Setup

The database will be automatically created when you first run the application. The following collections will be created:
- `transactions` - Payment transactions
- `formsubmissions` - Contact and volunteer form submissions
- `newsletters` - Newsletter subscribers

---

## Environment Configuration

### Production Environment Variables
For production, update these in your hosting platform:

```env
NODE_ENV=production
FRONTEND_URL=https://your-website-url.com
BACKEND_URL=https://your-api-url.com
MONGODB_URI=your_production_mongodb_uri
```

---

## Free Hosting Options

### Option 1: Render (Recommended - Free Tier Available)
**Backend API:**
1. Go to https://render.com
2. Sign up for free account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** apeh-charity-api
   - **Environment:** Node
   - **Build Command:** `cd api && npm install`
   - **Start Command:** `cd api && npm start`
   - **Environment Variables:** Add all variables from `.env`

**Frontend:**
1. Click "New +" → "Static Site"
2. Connect your repository
3. Configure:
   - **Build Command:** (leave empty for static site)
   - **Publish Directory:** (root directory)

### Option 2: Vercel (Free Tier)
**Backend API:**
1. Go to https://vercel.com
2. Sign up and install Vercel CLI:
```bash
npm install -g vercel
```
3. Deploy:
```bash
cd api
vercel
```
4. Add environment variables in Vercel dashboard

**Frontend:**
1. Deploy frontend:
```bash
vercel
```

### Option 3: Netlify (Free Tier)
**Frontend:**
1. Go to https://netlify.com
2. Drag and drop your project folder
3. Configure build settings (if needed)

**Backend API:**
- Use Render or Railway for backend (Netlify Functions have limitations)

### Option 4: Railway (Free Trial)
**Backend API:**
1. Go to https://railway.app
2. Sign up
3. Create new project
4. Deploy from GitHub
5. Add environment variables

### Option 5: Heroku (Free Tier Discontinued, but Paid Options Available)
1. Go to https://heroku.com
2. Create account
3. Install Heroku CLI
4. Deploy:
```bash
cd api
heroku create apeh-charity-api
git push heroku main
heroku config:set NODE_ENV=production
# Add other environment variables
```

---

## Deployment Steps

### Step 1: Prepare Your Code
1. Update all API URLs in frontend JavaScript files
2. Test locally first
3. Commit all changes to Git

### Step 2: Deploy Backend API
1. Choose a hosting platform (Render recommended)
2. Connect your repository
3. Set build and start commands
4. Add all environment variables
5. Deploy

### Step 3: Deploy Frontend
1. Update API_BASE_URL in all JS files to point to your deployed backend
2. Deploy frontend to static hosting (Vercel, Netlify, or Render)
3. Test all functionality

### Step 4: Configure Webhooks
1. **Flutterwave Webhook:**
   - Go to Flutterwave Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-backend-url.com/api/webhooks/flutterwave`
   - Copy the secret hash and add to `.env` as `FLUTTERWAVE_SECRET_HASH`

2. **Paystack Webhook:**
   - Go to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-backend-url.com/api/webhooks/paystack`
   - The secret is your `PAYSTACK_SECRET_KEY`

### Step 5: Update CORS Settings
In `api/server.js`, update CORS to allow your frontend domain:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-website-url.com',
    credentials: true
}));
```

---

## Testing

### Test Payment Flow
1. Go to donation page
2. Fill in donation form
3. Select Flutterwave or Paystack
4. Complete test payment
5. Verify transaction in database

### Test Forms
1. Test contact form
2. Test volunteer form
3. Test newsletter subscription
4. Verify emails are sent via Brevo
5. Check database for submissions

### Test API Endpoints
```bash
# Health check
curl https://your-api-url.com/health

# Test payment initialization
curl -X POST https://your-api-url.com/api/payments/flutterwave/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"email":"test@example.com","project":"flood-relief"}'
```

---

## Troubleshooting

### Backend Not Starting
- Check if MongoDB is running
- Verify all environment variables are set
- Check port 3000 is not in use
- Review error logs

### Payment Not Working
- Verify API keys are correct
- Check CORS settings
- Verify webhook URLs are configured
- Check browser console for errors

### Emails Not Sending
- Verify Brevo API key is correct
- Check Brevo account limits
- Review email templates
- Check spam folder

### Database Connection Issues
- Verify MongoDB URI is correct
- Check network connectivity
- Verify database credentials
- Check MongoDB Atlas IP whitelist

### Frontend Not Connecting to Backend
- Verify API_BASE_URL is correct
- Check CORS settings on backend
- Verify backend is running
- Check browser console for errors

---

## Security Checklist

- [ ] Never commit `.env` file to Git
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Use strong MongoDB passwords
- [ ] Regularly update dependencies
- [ ] Monitor API usage and logs
- [ ] Set up error tracking (Sentry, etc.)

---

## Support

For issues or questions:
- Check the error logs
- Review API documentation
- Contact: osarogiesam@gmail.com

---

## Next Steps After Deployment

1. **Monitor Performance:**
   - Set up logging (Winston, Morgan)
   - Monitor API response times
   - Track error rates

2. **Set Up Analytics:**
   - Google Analytics for frontend
   - Track donation conversions
   - Monitor form submissions

3. **Backup Strategy:**
   - Regular database backups
   - Version control for code
   - Document configuration

4. **Scaling:**
   - Monitor server resources
   - Optimize database queries
   - Consider CDN for static assets

---

## Important Notes

- **Test Mode:** Currently using test API keys. Switch to live keys for production.
- **Database:** Free MongoDB Atlas tier has limitations. Consider upgrading for production.
- **Email Limits:** Brevo free tier has sending limits. Monitor usage.
- **Payment Processing:** Test all payment flows thoroughly before going live.

---

**Last Updated:** January 2025
**Version:** 1.0.0

