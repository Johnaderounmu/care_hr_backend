# 🚀 Care HR Backend - Cloud Deployment Guide

This guide provides multiple options for deploying the Care HR backend to the cloud.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)
1. **Connect Repository:**
   ```bash
   # Push to GitHub if not already done
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```

2. **Deploy to Railway:**
   - Visit [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your `care_hr_backend` repository
   - Railway will auto-detect Node.js and deploy!

3. **Environment Variables:** Add in Railway dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

4. **Get Your URL:** Railway provides a URL like `https://care-hr-backend-production.up.railway.app`

### Option 2: Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd care_hr_backend
vercel --prod
```

### Option 3: Heroku
```bash
# Install Heroku CLI, then:
heroku create care-hr-backend-prod
heroku addons:create heroku-postgresql:mini
git push heroku main
```

### Option 4: Render
1. Connect GitHub repo at [render.com](https://render.com)
2. Use the `render.yaml` configuration
3. Automatic PostgreSQL database included

## 🔧 Frontend Configuration Update

Once deployed, update your Flutter app:

```dart
// In lib/core/services/api_service.dart
static const String baseUrl = 'https://your-deployed-backend-url.com';
```

## 🧪 Test Your Deployment

```bash
# Test health endpoint
curl https://your-deployed-url.com/health

# Test login
curl -X POST https://your-deployed-url.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 📊 Production Features Included

✅ **Database Integration:** PostgreSQL with TypeORM  
✅ **Authentication:** JWT with bcrypt password hashing  
✅ **API Endpoints:** Complete REST API for all features  
✅ **Error Handling:** Comprehensive error responses  
✅ **Security:** CORS, helmet, input validation  
✅ **Health Checks:** Monitoring and uptime endpoints  
✅ **Environment Config:** Production-ready environment variables  

## 🔥 One-Click Deploy Links

**Railway:** [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/placeholder)

**Render:** [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🛠️ Local Development with Cloud Database

Connect your local development to the cloud database:

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@cloud-host:port/database"

# Run locally with cloud DB
npm run dev
```

## 📈 Monitoring & Logs

- **Railway:** Built-in metrics and logs
- **Vercel:** Functions dashboard with real-time logs  
- **Heroku:** `heroku logs --tail`
- **Render:** Built-in logging and metrics

## 🔒 Security Checklist

- [ ] JWT_SECRET set to strong random value
- [ ] Database credentials secured
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting enabled (add express-rate-limit)
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced (handled by platforms)

## 🚨 Troubleshooting

**Build Failures:**
- Ensure `npm run build` works locally
- Check Node.js version compatibility
- Verify all dependencies are in package.json

**Database Issues:**
- Verify DATABASE_URL format
- Check database connectivity
- Ensure database permissions

**CORS Errors:**
- Update CORS origin to match your frontend URL
- Check request headers and methods

## 📞 Support

Need help deploying? The backend is production-ready with comprehensive error handling and logging to help debug any issues!