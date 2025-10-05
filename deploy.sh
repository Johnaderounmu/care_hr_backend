#!/bin/bash

# 🚀 Care HR Backend - One-Click Cloud Deployment Script

echo "🚀 Care HR Backend Cloud Deployment"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the care_hr_backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

echo "🌐 Available deployment options:"
echo ""
echo "1. 🚂 Railway (Recommended - Free tier available)"
echo "2. ⚡ Vercel (Serverless - Good for APIs)"  
echo "3. 🟣 Heroku (Classic PaaS)"
echo "4. 🎨 Render (Modern PaaS)"
echo "5. 🏠 Local deployment guide"
echo ""

read -p "Choose deployment option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚂 Railway Deployment:"
        echo "1. Visit https://railway.app"
        echo "2. Click 'Deploy from GitHub repo'"
        echo "3. Select your care_hr_backend repository"
        echo "4. Add environment variables:"
        echo "   - NODE_ENV=production"
        echo "   - JWT_SECRET=$(openssl rand -base64 32)"
        echo "   - DATABASE_URL=<provided by Railway>"
        echo ""
        echo "✅ Railway will auto-deploy your app!"
        ;;
    2)
        echo ""
        echo "⚡ Vercel Deployment:"
        echo "Installing Vercel CLI..."
        npm install -g vercel 2>/dev/null || echo "⚠️  Please install Vercel CLI: npm i -g vercel"
        echo ""
        echo "Run: vercel --prod"
        echo "Follow the prompts to deploy!"
        ;;
    3)
        echo ""
        echo "🟣 Heroku Deployment:"
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Run these commands:"
        echo "   heroku create care-hr-backend-\$(date +%s)"
        echo "   heroku addons:create heroku-postgresql:mini"
        echo "   git push heroku main"
        ;;
    4)
        echo ""
        echo "🎨 Render Deployment:"
        echo "1. Visit https://render.com"
        echo "2. Connect your GitHub repository"  
        echo "3. Use Web Service with these settings:"
        echo "   - Build Command: npm ci && npm run build"
        echo "   - Start Command: npm run start:prod"
        echo "   - Environment: Node"
        ;;
    5)
        echo ""
        echo "🏠 Local Production Deployment:"
        echo "1. Set environment variables:"
        echo "   export NODE_ENV=production"
        echo "   export JWT_SECRET=\$(openssl rand -base64 32)"
        echo "   export DATABASE_URL=postgresql://user:pass@localhost:5432/carehr_prod"
        echo ""
        echo "2. Start the server:"
        echo "   npm run start:prod"
        echo ""
        echo "3. Test the deployment:"
        echo "   curl http://localhost:4000/health"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔧 After deployment, update your Flutter app:"
echo "Update baseUrl in lib/core/services/api_service.dart to your deployed URL"
echo ""
echo "🧪 Test your deployment:"
echo "curl https://your-deployed-url.com/health"
echo ""
echo "✅ Deployment guide complete!"
echo "📖 See DEPLOYMENT.md for detailed instructions"