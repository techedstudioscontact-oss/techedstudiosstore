# Teched Studios Store

Premium app marketplace built with Firebase, featuring user authentication, favorites, and modern UI/UX.

## 🌟 Features

- **User Authentication** - Email/Password & Google Sign-In
- **Favorites System** - Save your favorite apps with heart animations
- **3D Animation** - Interactive Spline 3D viewer on homepage
- **Toast Notifications** - Beautiful feedback system
- **Admin Panel** - Upload, edit, and delete apps
- **Real-time Sync** - Firebase-powered live updates
- **Responsive Design** - Mobile-friendly across all devices

## 🚀 Live Demo

Visit: **[Your Firebase URL will appear here after deployment]**

## 📦 Tech Stack

- **Frontend**: HTML5, CSS3 (Modern animations), Vanilla JavaScript
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **3D Graphics**: Spline Viewer
- **Deployment**: GitHub Actions → Firebase Hosting

## 🛠️ Setup

### Prerequisites
- Firebase project
- GitHub account

### Local Development

1. Clone the repository:
```bash
git clone [your-repo-url]
cd "Teched Studios Store"
```

2. Update Firebase config in `firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Serve locally:
```bash
npx serve .
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select project
3. Enable Authentication (Email & Google)
4. Create Firestore database
5. Enable Firebase Hosting

### Deploy via GitHub Actions

1. **Get Firebase Service Account**:
   - Go to Firebase Console → Project Settings
   - Service Accounts tab
   - Generate new private key
   - Download the JSON file

2. **Add to GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets
   - Add new secret: `FIREBASE_SERVICE_ACCOUNT`
   - Paste the entire JSON content

3. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

4. **Automatic Deployment**:
   - GitHub Actions will automatically deploy
   - Check Actions tab for deployment status
   - Your site will be live at `https://[project-id].web.app`

## 📁 Project Structure

```
Teched Studios Store/
├── index.html              # Main HTML file
├── styles.css              # Core styles
├── app.js                  # Main application logic
├── auth.js                 # Authentication module
├── favorites.js            # Favorites system
├── toast.js                # Toast notifications
├── firebase-config.js      # Firebase configuration
├── animations.css          # Animation library
├── toast.css               # Toast styles
├── favorites.css           # Favorites styles
├── firebase.json           # Firebase Hosting config
└── .github/
    └── workflows/
        └── firebase-deploy.yml  # Auto-deployment workflow
```

## 🎨 Features in Detail

### User Authentication
- Email/password registration and login
- Google OAuth integration
- Persistent sessions
- Password reset functionality

### Favorites System
- Heart icon on each app card
- Firebase-synced favorites
- Login required to save favorites
- Real-time updates across devices

### Admin Panel
- Secure password-protected admin access
- Upload new apps with metadata
- Edit existing apps
- Delete apps with confirmation

### UI/UX
- Modern glassmorphism design
- Smooth animations and transitions
- Toast notifications for feedback
- Responsive mobile design
- 3D Spline animation on hero section

## 🔐 Security

### Firestore Security Rules

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - private
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /favorites/{appId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Apps - public read, admin write
    match /apps/{appId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Contact

For questions: techedstudios.contact@gmail.com
