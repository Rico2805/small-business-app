import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  setLogLevel
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAz2J9qLCFXms9_V-lpyGzCnpvM_Ro14Xo",
  authDomain: "small-business-app-7e96b.firebaseapp.com",
  projectId: "small-business-app-7e96b",
  storageBucket: "small-business-app-7e96b.firebasestorage.app",
  messagingSenderId: "171887817635",
  appId: "1:171887817635:web:57a6da8bf26ed363956016",
  measurementId: "G-H64JKD2NHE"
};

// Extended timeout settings for slow network connections
const firestoreSettings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, // Better for poor connections
  // experimentalAutoDetectLongPolling: true, // Cannot use both settings together
  useFetchStreams: false, // Better for unreliable connections
};

// Set log level to debug for development
setLogLevel('debug');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use initializeFirestore instead of getFirestore to apply custom settings
const db = initializeFirestore(app, firestoreSettings);
const storage = getStorage(app);

// Enable offline persistence for Firestore (handle offline scenarios)
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence enabled successfully");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.error("Multiple tabs open, persistence can only be enabled in one tab at a time.");
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all features required for persistence
        console.error("Current environment doesn't support IndexedDB persistence");
      } else {
        console.error("Error enabling persistence:", err);
      }
    });
} catch (error) {
  console.warn("Could not enable persistence:", error);
}

// For local testing with emulators (if needed)
const useEmulators = false; // Set to true to connect to local emulators
if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { auth, db, storage };
