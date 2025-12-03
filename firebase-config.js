// Firebase Configuration
// TODO: Replace with your own Firebase project credentials
// Go to: https://console.firebase.google.com/
// 1. Create a new project (or use existing)
// 2. Go to Project Settings > General
// 3. Scroll down to "Your apps" and click Web icon
// 4. Copy the configuration object

const firebaseConfig = {
    apiKey: "AIzaSyAYgDBg0Ikwlrbc_vy_rvhz0tou36VDgG4",
    authDomain: "techedstudiosstore.firebaseapp.com",
    projectId: "techedstudiosstore",
    storageBucket: "techedstudiosstore.firebasestorage.app",
    messagingSenderId: "836888358880",
    appId: "1:836888358880:web:2604a9e8048bb6d251c585",
    measurementId: "G-FSPVC7W0M2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Firebase Auth
const auth = firebase.auth();

// Configure Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Admin password (in production, use proper authentication)
const ADMIN_PASSWORD_HASH = "teched2024"; // Change this to your desired password

// Export for use in app.js
window.firebaseDB = db;
window.firebaseAuth = auth;
window.googleProvider = googleProvider;
window.ADMIN_PASSWORD = ADMIN_PASSWORD_HASH;

console.log("✅ Firebase initialized successfully");
