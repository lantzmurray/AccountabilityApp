# Deployment Guide for AccountabilityApp

This React Native Expo app has been prepared for deployment with multiple options.

## 🚀 Quick Deployment Options

### Option 1: Expo Hosting (Recommended)
```bash
# Install Expo CLI if not already installed
npm install -g @expo/cli

# Login to Expo
expx expo login

# Publish to Expo
npx expo publish
```

### Option 2: Netlify
```bash
# Build for web
npx expo export --platform web

# Deploy to Netlify (requires Netlify account)
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist --prod
```

### Option 3: Vercel
```bash
# Build for web
npx expo export --platform web

# Deploy to Vercel (requires Vercel account)
npm install -g vercel
cd dist
vercel --prod
```

### Option 4: GitHub Pages
```bash
# Build for web
npx expo export --platform web

# Push to GitHub and enable GitHub Pages in repository settings
git add .
git commit -m "Add build files"
git push origin main

# Then go to GitHub repository settings > Pages > Source: GitHub Actions
```

### Option 5: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build for web
npx expo export --platform web

# Initialize Firebase
firebase login
firebase init hosting

# Deploy
firebase deploy
```

## 📱 Mobile App Deployment

### Android (Google Play Store)
```bash
# Build APK/AAB
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

### iOS (App Store)
```bash
# Build IPA
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

## 🔧 Build Configuration

The app is configured with:
- ✅ EAS Build setup (`eas.json`)
- ✅ Web export ready (`dist/` folder)
- ✅ Cross-platform database support (SQLite + sql.js)
- ✅ Production-ready build scripts

## 📋 Pre-deployment Checklist

- [ ] Test the app locally: `npm run web`
- [ ] Verify all features work in web build
- [ ] Update app version in `app.json`
- [ ] Test on different devices/browsers
- [ ] Configure environment variables if needed
- [ ] Set up analytics/monitoring

## 🌐 Live Demo

Once deployed, your app will be accessible at the provided URL from your chosen hosting service.

## 📞 Support

For deployment issues:
1. Check Expo documentation: https://docs.expo.dev/
2. Verify build logs for errors
3. Test locally before deploying
4. Check hosting service documentation