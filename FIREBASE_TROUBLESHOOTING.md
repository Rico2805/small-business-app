# Firebase Troubleshooting Guide

## Common Issues and Solutions

### "Client is offline" Errors

If you're seeing errors like:
```
[FirebaseError: Failed to get document because the client is offline]
```

Try these solutions in order:

1. **Check Internet Connection**
   - Make sure your device has a stable internet connection
   - Try connecting to a different network (switch from WiFi to mobile data)
   - Reset your router if possible

2. **Check Firebase Console Settings**
   - Login to [Firebase Console](https://console.firebase.google.com/)
   - Verify the project exists and is active
   - Check that Firestore Database is enabled
   - Ensure Authentication is enabled with Email/Password method

3. **Create Required Collections**
   - In Firestore Database, create a collection named `systemSettings`
   - Add a document with ID `settings` containing these fields:
     ```
     allowNewRegistrations: true (Boolean)
     maintenanceMode: false (Boolean)
     allowPayments: true (Boolean)
     defaultLanguage: "en" (String)
     ```

4. **Check Firebase Rules**
   - Go to Firestore Database > Rules
   - For testing, set rules to allow read/write:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - Click "Publish"

5. **Clear App Cache and Storage**
   - Close the app completely
   - Clear app cache/data in device settings
   - Restart the app

6. **Check Network Restrictions**
   - Some networks (corporate, school, etc.) block Firebase
   - Try using the app on a different network

7. **Use Firebase Emulators for Local Development**
   - Set up [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
   - Update firebase.js to use emulators (change `useEmulators = true`)

## Developer Login

For developer access:
- Username: Franco
- Password: Rico&2004

## Firebase Configuration

Make sure your `config/firebase.js` has the correct configuration from your Firebase console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAz2J9qLCFXms9_V-lpyGzCnpvM_Ro14Xo",
  authDomain: "small-business-app-7e96b.firebaseapp.com",
  projectId: "small-business-app-7e96b",
  storageBucket: "small-business-app-7e96b.firebasestorage.app",
  messagingSenderId: "171887817635",
  appId: "1:171887817635:web:57a6da8bf26ed363956016",
  measurementId: "G-H64JKD2NHE"
};
```
