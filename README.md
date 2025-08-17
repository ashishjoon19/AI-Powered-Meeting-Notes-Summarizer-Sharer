# AI Meeting Summarizer

A full-stack AI-powered application that generates structured summaries from meeting transcripts using custom instructions and allows sharing via email.

## 🚀 Features

- **AI-Powered Summarization**: Uses Groq AI to generate intelligent summaries
- **Custom Instructions**: Specify how you want the summary formatted (bullet points, action items, timeline, etc.)
- **Editable Summaries**: Edit generated summaries before sharing
- **Email Sharing**: Share summaries with multiple recipients via email
- **Persistent Storage**: SQLite database to save all meetings and summaries
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Custom CSS** with utility classes (Tailwind-inspired)
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Groq AI SDK** for AI-powered summarization
- **SQLite3** for data persistence
- **Nodemailer** for email functionality
- **Multer** for file handling

### Deployment
- **Vercel** for frontend hosting
- **Railway** for backend hosting

## 📋 Prerequisites

- Node.js 16+ and npm
- Groq API key ([Get one here](https://console.groq.com/))
- Gmail account with App Password (for email functionality)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-meeting-summarizer
npm run install-all
```

### 2. Environment Setup

Create `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit `.env` with your credentials:

```env
GROQ_API_KEY=your_groq_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
PORT=5000
```

**Note**: For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASS

### 3. Run Development Server

```bash
# From root directory
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000).

## 🏗️ Project Structure

```
ai-meeting-summarizer/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Component styles
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── package.json
│   └── env.example        # Environment template
├── package.json            # Root package.json
├── vercel.json            # Frontend deployment config
├── railway.json           # Backend deployment config
└── README.md              # This file
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server status

### Summaries
- `POST /api/generate-summary` - Generate AI summary
- `GET /api/meeting/:id` - Get meeting by ID
- `PUT /api/meeting/:id/summary` - Update summary
- `GET /api/meetings` - Get all meetings

### Sharing
- `POST /api/share-summary` - Share summary via email

## 📱 Usage

### 1. Generate Summary
1. Paste your meeting transcript in the first textarea
2. Enter custom instructions (e.g., "Summarize in bullet points for executives")
3. Click "Generate Summary"
4. Wait for AI processing (usually 5-15 seconds)

### 2. Edit Summary
1. Click "Edit Summary" button
2. Make your changes in the editable textarea
3. Click "Save Changes" to persist updates

### 3. Share Summary
1. Enter recipient email addresses (comma-separated)
2. Click "Share via Email"
3. Recipients will receive a formatted email with the summary

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-deploy from `vercel.json`

### Backend (Railway)

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy using `railway.json` configuration

### Environment Variables for Production

Set these in your deployment platform:

```env
GROQ_API_KEY=your_production_groq_key
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_app_password
PORT=5000
```

## 🔧 Customization

### AI Model
Change the Groq model in `server/index.js`:

```javascript
model: 'llama3-8b-8192',  // Change to your preferred model
```

### Email Template
Modify the email HTML template in `server/index.js`:

```javascript
html: `
  <h2>Meeting Summary</h2>
  <p><strong>Original Prompt:</strong> ${meeting.prompt}</p>
  <hr>
  <div style="white-space: pre-wrap;">${summary}</div>
  <hr>
  <p><em>This summary was generated using AI technology.</em></p>
`
```

### Styling
Modify `client/src/index.css` and `client/src/App.css` for custom appearance.

## 🐛 Troubleshooting

### Common Issues

1. **Groq API Error**: Check your API key and billing status
2. **Email Not Sending**: Verify Gmail credentials and App Password
3. **Database Errors**: Ensure SQLite has write permissions
4. **CORS Issues**: Check backend CORS configuration

### Development Debugging

```bash
# Check backend logs
cd server && npm run dev

# Check frontend logs
cd client && npm start

# Test API endpoints
curl http://localhost:5000/api/health
```

## 📊 Performance

- **AI Response Time**: 5-15 seconds (depends on transcript length)
- **Database**: SQLite for simplicity (can be upgraded to PostgreSQL for production)
- **File Upload**: 10MB limit (configurable in multer settings)

## 🔒 Security Considerations

- API keys stored in environment variables
- Input validation on all endpoints
- SQL injection protection via parameterized queries
- CORS configured for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open a GitHub issue

## 🎯 Future Enhancements

- [ ] File upload support (PDF, DOCX)
- [ ] Multiple AI model options
- [ ] User authentication
- [ ] Summary templates
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] Integration with calendar apps
- [ ] Advanced analytics and insights

---

**Built with ❤️ using React, Node.js, and Groq AI**
