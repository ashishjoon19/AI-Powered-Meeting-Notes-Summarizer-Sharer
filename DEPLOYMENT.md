# Deployment Guide

This guide will walk you through deploying the AI Meeting Summarizer to production.

## 🚀 Deployment Overview

- **Frontend**: Vercel (React app)
- **Backend**: Railway (Node.js server)
- **Database**: SQLite (file-based, included with Railway deployment)

## 📋 Prerequisites

1. **GitHub Account** with the project repository
2. **Vercel Account** (free tier available)
3. **Railway Account** (free tier available)
4. **Groq API Key** ([Get one here](https://console.groq.com/))
5. **Gmail Account** with App Password

## 🔑 Environment Setup

### 1. Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (you'll need this for Railway)

### 2. Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password

## 🌐 Frontend Deployment (Vercel)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Click "Deploy"

### Step 3: Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app
   ```

## 🚂 Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [Railway](https://railway.app/) and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect it's a Node.js app

### Step 2: Configure Environment Variables
In Railway dashboard:
1. Go to Variables tab
2. Add these environment variables:

```env
GROQ_API_KEY=your_groq_api_key_here
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password_here
PORT=5000
NODE_ENV=production
```

### Step 3: Deploy
1. Railway will automatically build and deploy
2. Wait for deployment to complete
3. Copy the generated URL (e.g., `https://your-app.railway.app`)

## 🔗 Connect Frontend to Backend

### Update API Base URL
1. In Vercel, go to your project
2. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app
   ```
3. Redeploy the frontend

### Update CORS (if needed)
If you get CORS errors, update `server/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 🧪 Test Deployment

### 1. Test Backend Health
```bash
curl https://your-railway-app.railway.app/api/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

### 2. Test Frontend
1. Visit your Vercel URL
2. Try generating a summary
3. Check if it connects to the backend

### 3. Test Email Functionality
1. Generate a summary
2. Try sharing it with your own email
3. Check if you receive the email

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptoms**: Browser console shows CORS errors
**Solution**: Update CORS configuration in Railway environment variables

#### 2. API Connection Failed
**Symptoms**: Frontend can't connect to backend
**Solution**: 
- Check Railway app URL
- Verify environment variables
- Check Railway logs

#### 3. Email Not Sending
**Symptoms**: Summary generation works but email fails
**Solution**:
- Verify Gmail credentials
- Check App Password is correct
- Review Railway logs for email errors

#### 4. Groq API Errors
**Symptoms**: Summary generation fails
**Solution**:
- Verify GROQ_API_KEY is correct
- Check Groq billing status
- Review Railway logs

### Debugging Commands

#### Check Railway Logs
1. Go to Railway dashboard
2. Click on your app
3. Go to Deployments tab
4. Click on latest deployment
5. View logs

#### Check Vercel Logs
1. Go to Vercel dashboard
2. Click on your project
3. Go to Functions tab
4. View function logs

## 📊 Monitoring

### Railway Monitoring
- **Uptime**: Railway provides basic uptime monitoring
- **Logs**: Real-time logs in dashboard
- **Metrics**: CPU, memory usage

### Vercel Monitoring
- **Performance**: Core Web Vitals
- **Analytics**: Page views, user behavior
- **Functions**: API call metrics

## 🔄 Continuous Deployment

### Automatic Deployments
Both Vercel and Railway will automatically deploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deployments
- **Vercel**: Go to dashboard → Deployments → Redeploy
- **Railway**: Go to dashboard → Deployments → Deploy

## 💰 Cost Optimization

### Vercel (Frontend)
- **Free Tier**: 100GB bandwidth/month
- **Pro Tier**: $20/month for unlimited

### Railway (Backend)
- **Free Tier**: $5 credit/month
- **Paid Tier**: Pay-as-you-use

### Groq (AI)
- **Pricing**: Pay per token
- **Free Tier**: Available for new users

## 🚨 Production Checklist

- [ ] Environment variables set in Railway
- [ ] CORS configured for production domains
- [ ] Database migrations completed
- [ ] Email functionality tested
- [ ] API endpoints responding correctly
- [ ] Frontend connecting to backend
- [ ] SSL certificates active
- [ ] Monitoring and logging configured
- [ ] Error handling implemented
- [ ] Performance optimized

## 🔐 Security Considerations

1. **API Keys**: Never commit to GitHub
2. **Environment Variables**: Use Railway's secure variable system
3. **CORS**: Restrict to production domains only
4. **Rate Limiting**: Consider implementing for production
5. **Input Validation**: Already implemented in backend

## 📈 Scaling Considerations

### When to Scale
- **Frontend**: Usually not needed (Vercel handles this)
- **Backend**: When you hit Railway's limits
- **Database**: Consider PostgreSQL for high traffic

### Scaling Options
1. **Railway**: Upgrade to paid tier
2. **Database**: Migrate to managed PostgreSQL
3. **CDN**: Add Cloudflare for static assets
4. **Load Balancing**: Multiple Railway instances

---

## 🎯 Next Steps

After successful deployment:
1. **Monitor**: Check logs and performance
2. **Test**: Run through all features
3. **Optimize**: Based on usage patterns
4. **Document**: Update team documentation
5. **Backup**: Set up database backups

## 🆘 Support

- **Vercel**: [Documentation](https://vercel.com/docs)
- **Railway**: [Documentation](https://docs.railway.app/)
- **Groq**: [Documentation](https://console.groq.com/docs)
- **GitHub Issues**: For project-specific problems

---

**Happy Deploying! 🚀**
