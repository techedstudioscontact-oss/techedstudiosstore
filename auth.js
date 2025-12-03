// ==================== User Authentication Module ====================
// This module handles user authentication using Firebase Auth

// Current user state
let currentUser = null;

// ==================== Auth State Observer ====================
function initializeAuth() {
    firebaseAuth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI(user);

        // Initialize favorites manager with current user
        if (window.favoritesManager) {
            favoritesManager.init(user);
        }

        if (user) {
            console.log('User signed in:', user.email);
        } else {
            console.log('User signed out');
        }
    });
}

// ==================== UI Updates ====================
function updateAuthUI(user) {
    const authButton = document.getElementById('auth-button');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (user) {
        // User is signed in
        authButton.style.display = 'none';
        userProfile.style.display = 'flex';

        // Set user info
        userName.textContent = user.displayName || user.email.split('@')[0];
        userEmail.textContent = user.email;

        // Set avatar (use photoURL if available, otherwise use initial)
        if (user.photoURL) {
            userAvatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initial = (user.displayName || user.email)[0].toUpperCase();
            userAvatar.innerHTML = initial;
        }
    } else {
        // User is signed out
        authButton.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// ==================== Modal Controls ====================
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');

    modal.classList.add('active');

    if (mode === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }

    clearAuthErrors();
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
    clearAuthForms();
    clearAuthErrors();
}

function switchAuthMode(mode) {
    openAuthModal(mode);
}

function clearAuthForms() {
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
}

function clearAuthErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
}

// ==================== Email/Password Authentication ====================
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    try {
        await firebaseAuth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = getErrorMessage(error.code);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const errorElement = document.getElementById('signup-error');

    // Validate passwords match
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }

    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);

        // Update profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });

        closeAuthModal();
    } catch (error) {
        console.error('Signup error:', error);
        errorElement.textContent = getErrorMessage(error.code);
    }
}

// ==================== Google Sign-In ====================
async function handleGoogleSignIn() {
    try {
        await firebaseAuth.signInWithPopup(googleProvider);
        closeAuthModal();
    } catch (error) {
        console.error('Google sign in error:', error);
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = getErrorMessage(error.code);
    }
}

// ==================== Logout ====================
async function handleLogout() {
    try {
        await firebaseAuth.signOut();
        // Close dropdown if open
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

// ==================== Password Reset ====================
async function handlePasswordReset() {
    const email = document.getElementById('login-email').value.trim();
    const errorElement = document.getElementById('login-error');

    if (!email) {
        errorElement.textContent = 'Please enter your email address';
        return;
    }

    try {
        await firebaseAuth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        errorElement.textContent = getErrorMessage(error.code);
    }
}

// ==================== Error Messages ====================
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled',
        'auth/weak-password': 'Password is too weak',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/popup-closed-by-user': 'Sign-in popup was closed',
        'auth/cancelled-popup-request': 'Only one popup request is allowed at a time'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// ==================== Toggle User Dropdown ====================
function toggleUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userProfile = document.getElementById('user-profile');
    const dropdown = document.querySelector('.user-dropdown');

    if (dropdown && !userProfile.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// ==================== Event Listeners Setup ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();

    // Auth modal close
    document.getElementById('close-auth-modal')?.addEventListener('click', closeAuthModal);
    document.getElementById('auth-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') {
            closeAuthModal();
        }
    });

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('google-signin-btn')?.addEventListener('click', handleGoogleSignIn);
    document.getElementById('forgot-password-btn')?.addEventListener('click', handlePasswordReset);
    document.getElementById('switch-to-signup')?.addEventListener('click', () => switchAuthMode('signup'));

    // Signup form
    document.getElementById('signup-form')?.addEventListener('submit', handleSignup);
    document.getElementById('google-signup-btn')?.addEventListener('click', handleGoogleSignIn);
    document.getElementById('switch-to-login')?.addEventListener('click', () => switchAuthMode('login'));

    // User profile
    document.getElementById('user-profile')?.addEventListener('click', toggleUserDropdown);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Auth button
    document.getElementById('auth-button')?.addEventListener('click', () => openAuthModal('login'));
});

// Export functions for external use
window.openAuthModal = openAuthModal;
window.getCurrentUser = () => currentUser;

console.log('✅ Auth module initialized');
