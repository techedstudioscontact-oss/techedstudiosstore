// ==================== Favorites System ====================
// Manages user favorites with Firebase sync and animations

class FavoritesManager {
    constructor() {
        this.favorites = new Set();
        this.userId = null;
        this.initialized = false;
        this.listeners = [];
    }

    // Initialize favorites for logged-in user
    async init(user) {
        if (!user) {
            this.userId = null;
            this.favorites.clear();
            this.initialized = false;
            this.notifyListeners();
            return;
        }

        this.userId = user.uid;
        await this.loadFavorites();
        this.initialized = true;
        this.notifyListeners();
    }

    // Load favorites from Firebase
    async loadFavorites() {
        if (!this.userId) return;

        try {
            const snapshot = await firebaseDB
                .collection('users')
                .doc(this.userId)
                .collection('favorites')
                .get();

            this.favorites.clear();
            snapshot.forEach(doc => {
                this.favorites.add(doc.id);
            });

            console.log(`✅ Loaded ${this.favorites.size} favorites`);
        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            toast.error('Failed to load favorites');
        }
    }

    // Check if app is favorited
    isFavorite(appId) {
        return this.favorites.has(appId);
    }

    // Toggle favorite status
    async toggle(appId, appName) {
        if (!this.userId) {
            toast.warning('Please sign in to save favorites');
            window.openAuthModal('login');
            return false;
        }

        const wasFavorite = this.favorites.has(appId);

        if (wasFavorite) {
            await this.remove(appId);
            toast.success(`Removed from favorites`);
        } else {
            await this.add(appId, appName);
            toast.success(`Added to favorites`);
        }

        return !wasFavorite;
    }

    // Add to favorites
    async add(appId, appName) {
        if (!this.userId) return;

        try {
            await firebaseDB
                .collection('users')
                .doc(this.userId)
                .collection('favorites')
                .doc(appId)
                .set({
                    appId: appId,
                    appName: appName,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            this.favorites.add(appId);
            this.notifyListeners();
            console.log('✅ Added to favorites:', appName);
        } catch (error) {
            console.error('❌ Error adding favorite:', error);
            toast.error('Failed to add favorite');
        }
    }

    // Remove from favorites
    async remove(appId) {
        if (!this.userId) return;

        try {
            await firebaseDB
                .collection('users')
                .doc(this.userId)
                .collection('favorites')
                .doc(appId)
                .delete();

            this.favorites.delete(appId);
            this.notifyListeners();
            console.log('✅ Removed from favorites');
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
            toast.error('Failed to remove favorite');
        }
    }

    // Get all favorites
    getFavorites() {
        return Array.from(this.favorites);
    }

    // Get favorites count
    getCount() {
        return this.favorites.size;
    }

    // Subscribe to favorites changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.favorites));
    }

    // Create favorite button HTML
    createButton(appId, appName) {
        const isFav = this.isFavorite(appId);
        return `
            <button class="favorite-btn ${isFav ? 'active' : ''}" 
                    data-app-id="${appId}" 
                    data-app-name="${appName}"
                    title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                    aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                <svg class="heart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z" 
                          stroke="currentColor" 
                          stroke-width="2" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"
                          class="heart-outline"/>
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z" 
                          fill="currentColor"
                          class="heart-fill"/>
                </svg>
            </button>
        `;
    }

    // Attach event listeners to favorite buttons
    attachListeners() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();

                const appId = btn.dataset.appId;
                const appName = btn.dataset.appName;

                // Animate button
                btn.classList.add('animating');

                const isNowFavorite = await this.toggle(appId, appName);

                // Update button state
                if (isNowFavorite) {
                    btn.classList.add('active');
                    btn.title = 'Remove from favorites';
                } else {
                    btn.classList.remove('active');
                    btn.title = 'Add to favorites';
                }

                // Remove animation class
                setTimeout(() => {
                    btn.classList.remove('animating');
                }, 600);
            });
        });
    }
}

// Create global instance
const favoritesManager = new FavoritesManager();

// Export for use in other files
window.favoritesManager = favoritesManager;

console.log('✅ Favorites system initialized');
