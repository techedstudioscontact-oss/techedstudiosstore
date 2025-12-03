# Manual Firebase Deployment Steps

Since the automatic browser login isn't working, follow these manual steps:

## Option 1: Use Firebase Web Console (Easiest)

1. Go to https://console.firebase.google.com/
2. Login with **techedstudios.contact@gmail.com**
3. Create a new project or select existing one
4. Go to **Build** → **Hosting** → **Get Started**
5. Follow the setup wizard

## Option 2: Manual CLI Login

### Step 1: Open the login URL manually

Run this command and copy the URL that appears:
```powershell
firebase login --no-localhost
```

### Step 2: Visit the URL
- Paste the URL into your browser
- Login with **techedstudios.contact@gmail.com**
- Copy the authorization code

### Step 3: Paste the code
- Go back to terminal
- Paste the authorization code
- Press Enter

## Option 3: Deploy via GitHub Actions (Automated)

I can set up automatic deployment via GitHub that doesn't require local authentication!

## After Authentication Works

Once logged in, update the project ID in `.firebaserc`:

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID_HERE"
  }
}
```

Then deploy:
```powershell
firebase deploy --only hosting
```

## Need Help?

Let me know which option you'd like to try and I can guide you through it!
