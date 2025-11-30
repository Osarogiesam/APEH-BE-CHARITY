# APEH-BE-CHARITY Website

A comprehensive NGO website with integrated payment systems, email services, and form handling.

## 🚀 Features

- **Payment Integration:**
  - Flutterwave (Cards, Bank Transfer, Mobile Money)
  - Paystack (Cards, Bank Transfer)
  - All payments in Nigerian Naira (NGN)

- **Email Services:**
  - Brevo (Sendinblue) integration for transactional emails
  - Newsletter subscription management
  - Contact form submissions
  - Volunteer applications

- **Database:**
  - MongoDB for storing transactions, form submissions, and newsletter subscribers
  - Automatic data persistence

- **Forms:**
  - Donation form with payment integration
  - Contact form with Brevo and mailto fallback
  - Volunteer application form
  - Newsletter subscription (available on all pages)

## 📁 Project Structure

```
ngo website/
├── api/                          # Backend API Server
│   ├── server.js                # Main server file
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── models/                  # Database models
│   │   ├── Transaction.js
│   │   ├── FormSubmission.js
│   │   └── Newsletter.js
│   ├── controllers/             # Business logic
│   │   ├── flutterwave.controller.js
│   │   ├── paystack.controller.js
│   │   └── brevo.controller.js
│   ├── routes/                  # API routes
│   │   ├── payments.js
│   │   ├── webhooks.js
│   │   └── brevo.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── js/                          # Frontend JavaScript
│   ├── payments.js             # Payment processing
│   ├── contact.js              # Contact form handling
│   ├── volunteer.js            # Volunteer form handling
│   ├── newsletter.js           # Newsletter subscription
│   └── script.js               # General utilities
│
├── CSS/
│   └── style.css               # Main stylesheet
│
├── *.html                       # HTML pages
│   ├── index.html
│   ├── donate.html
│   ├── contact.html
│   ├── volunteer.html
│   ├── about.html
│   ├── programs.html
│   └── news.html
│
├── DEPLOYMENT_GUIDE.md         # Detailed deployment instructions
└── README.md                   # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- API keys from Flutterwave, Paystack, and Brevo

### Installation

1. **Install Backend Dependencies:**
```bash
cd api
npm install
```

2. **Set Up Environment Variables:**
```bash
cd api
copy .env.example .env
# Edit .env with your API keys
```

3. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

4. **Start Backend Server:**
```bash
cd api
npm start
# Or for development:
npm run dev
```

5. **Open Frontend:**
- Use a local server (Live Server extension in VS Code)
- Or open `index.html` directly in browser

## 🔧 Configuration

### API Keys
All API keys are already configured in the `.env.example` file:
- Flutterwave: Test keys provided
- Paystack: Test keys provided
- Brevo: API key provided

### Frontend API URL
Update the `API_BASE_URL` in these files:
- `js/payments.js`
- `js/contact.js`
- `js/volunteer.js`
- `js/newsletter.js`

Change from:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

To your production URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## 📝 API Endpoints

### Payment Endpoints
- `POST /api/payments/flutterwave/initialize` - Initialize Flutterwave payment
- `POST /api/payments/flutterwave/verify` - Verify Flutterwave payment
- `POST /api/payments/paystack/initialize` - Initialize Paystack payment
- `POST /api/payments/paystack/verify` - Verify Paystack payment

### Webhook Endpoints
- `POST /api/webhooks/flutterwave` - Flutterwave webhook
- `POST /api/webhooks/paystack` - Paystack webhook

### Brevo/Email Endpoints
- `POST /api/brevo/add-contact` - Add contact to Brevo
- `POST /api/brevo/send-email` - Send transactional email
- `POST /api/brevo/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/brevo/contact-form` - Submit contact form

## 🧪 Testing

### Test Payments
1. Go to `donate.html`
2. Fill in donation form
3. Select Flutterwave or Paystack
4. Use test card numbers:
   - **Flutterwave:** 5531886652142950
   - **Paystack:** 4084084084084081
5. Complete payment
6. Verify in database

### Test Forms
1. Test contact form on `contact.html`
2. Test volunteer form on `volunteer.html`
3. Test newsletter subscription on any page
4. Check emails in Brevo dashboard
5. Verify data in MongoDB

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment Steps:
1. Deploy backend to Render/Vercel/Railway
2. Deploy frontend to Vercel/Netlify
3. Update API URLs in frontend
4. Configure webhooks in payment gateways
5. Test all functionality

## 🔒 Security

- Never commit `.env` file
- Use environment variables for all secrets
- Enable HTTPS in production
- Set up proper CORS policies
- Regularly update dependencies

## 📧 Support

For issues or questions:
- Email: osarogiesam@gmail.com
- Check deployment guide for troubleshooting

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Flutterwave for payment processing
- Paystack for payment processing
- Brevo (Sendinblue) for email services
- MongoDB for database

---

**Version:** 1.0.0  
**Last Updated:** January 2025
