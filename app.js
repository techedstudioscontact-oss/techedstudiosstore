// ==================== Application State ====================
let currentPage = 'store';
let isAdminLoggedIn = false;
let allApps = [];
let filteredApps = [];
let currentCategory = 'all';

// ==================== DOM Elements ====================
const elements = {
    // Pages
    storePage: document.getElementById('store-page'),
    appDetailPage: document.getElementById('app-detail-page'),
    adminPage: document.getElementById('admin-page'),

    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),

    // Store
    searchInput: document.getElementById('search-input'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    appsGrid: document.getElementById('apps-grid'),
    appsCount: document.getElementById('apps-count'),

    // App Detail
    backToStore: document.getElementById('back-to-store'),
    appDetailContent: document.getElementById('app-detail-content'),

    // Admin
    adminLogin: document.getElementById('admin-login'),
    adminLoginForm: document.getElementById('admin-login-form'),
    adminPassword: document.getElementById('admin-password'),
    loginError: document.getElementById('login-error'),
    adminDashboard: document.getElementById('admin-dashboard'),
    adminLogoutBtn: document.getElementById('admin-logout-btn'),
    uploadAppBtn: document.getElementById('upload-app-btn'),
    adminAppsList: document.getElementById('admin-apps-list'),

    // Stats
    totalAppsStat: document.getElementById('total-apps-stat'),
    totalDownloadsStat: document.getElementById('total-downloads-stat'),

    // Modal
    uploadModal: document.getElementById('upload-modal'),
    closeModal: document.getElementById('close-modal'),
    uploadForm: document.getElementById('upload-form'),
    cancelUpload: document.getElementById('cancel-upload'),
    submitAppBtn: document.getElementById('submit-app'),
    modalTitle: document.getElementById('modal-title'),

    // Form fields
    appName: document.getElementById('app-name'),
    appDeveloper: document.getElementById('app-developer'),
    appCategory: document.getElementById('app-category'),
    appVersion: document.getElementById('app-version'),
    appDescription: document.getElementById('app-description'),
    appSize: document.getElementById('app-size'),
    appIconUrl: document.getElementById('app-icon-url'),
    appScreenshots: document.getElementById('app-screenshots'),
    appDownloadUrl: document.getElementById('app-download-url'),
    editAppId: document.getElementById('edit-app-id')
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadApps();
});

function initializeApp() {
    // Check if admin is logged in (session storage)
    isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isAdminLoggedIn && currentPage === 'admin') {
        showAdminDashboard();
    }
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });

    // Search
    elements.searchInput.addEventListener('input', handleSearch);

    // Category filter
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterApps();
        });
    });

    // Back to store
    elements.backToStore.addEventListener('click', () => {
        navigateToPage('store');
    });

    // Admin login
    elements.adminLoginForm.addEventListener('submit', handleAdminLogin);

    // Admin logout
    elements.adminLogoutBtn.addEventListener('click', handleAdminLogout);

    // Upload modal
    elements.uploadAppBtn.addEventListener('click', () => {
        openUploadModal();
    });
    elements.closeModal.addEventListener('click', closeUploadModal);
    elements.cancelUpload.addEventListener('click', closeUploadModal);

    // Upload form
    elements.uploadForm.addEventListener('submit', handleAppUpload);

    // Close modal on outside click
    elements.uploadModal.addEventListener('click', (e) => {
        if (e.target === elements.uploadModal) {
            closeUploadModal();
        }
    });
}

// ==================== Navigation ====================
function navigateToPage(page) {
    currentPage = page;

    // Update active nav link
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Show appropriate page
    const pages = [elements.storePage, elements.appDetailPage, elements.adminPage];
    pages.forEach(p => p.classList.remove('active'));

    if (page === 'store' || page === 'categories') {
        elements.storePage.classList.add('active');
    } else if (page === 'admin') {
        elements.adminPage.classList.add('active');
        if (isAdminLoggedIn) {
            showAdminDashboard();
        } else {
            showAdminLogin();
        }
    }
}

// ==================== Firebase - Load Apps ====================
async function loadApps() {
    try {
        // Show loading spinner
        elements.appsGrid.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading apps...</p>
            </div>
        `;

        // Listen to real-time updates
        firebaseDB.collection('apps').onSnapshot((snapshot) => {
            allApps = [];
            snapshot.forEach((doc) => {
                allApps.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by downloads (descending)
            allApps.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

            filterApps();
            updateStats();
            if (isAdminLoggedIn) {
                loadAdminApps();
            }
        }, (error) => {
            console.error('Error loading apps:', error);
            elements.appsGrid.innerHTML = `
                <div class="loading-spinner">
                    <p style="color: var(--error);">Failed to load apps. Please check Firebase configuration.</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 1rem;">
                        Make sure to update firebase-config.js with your Firebase credentials.
                    </p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error in loadApps:', error);
    }
}

// ==================== Search & Filter ====================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    filterApps(query);
}

function filterApps(searchQuery = '') {
    const query = searchQuery || elements.searchInput.value.toLowerCase().trim();

    filteredApps = allApps.filter(app => {
        const matchesCategory = currentCategory === 'all' || app.category === currentCategory;
        const matchesSearch = !query ||
            app.name.toLowerCase().includes(query) ||
            app.developer.toLowerCase().includes(query) ||
            app.description.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    displayApps(filteredApps);
}

// ==================== Display Apps ====================
function displayApps(apps) {
    elements.appsCount.textContent = `${apps.length} app${apps.length !== 1 ? 's' : ''} available`;

    if (apps.length === 0) {
        elements.appsGrid.innerHTML = `
            <div class="loading-spinner">
                <p>No apps found</p>
                <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">
                    Try a different search or category
                </p>
            </div>
        `;
        return;
    }

    elements.appsGrid.innerHTML = apps.map(app => `
        <div class="app-card" data-app-id="${app.id}">
            ${window.favoritesManager ? favoritesManager.createButton(app.id, app.name) : ''}
            <div class="app-card-header">
                <img src="${app.iconUrl}" alt="${app.name}" class="app-icon" onerror="this.src='https://via.placeholder.com/64?text=App'">
                <div class="app-info">
                 <h3 class="app-name">${escapeHtml(app.name)}</h3>
                    <p class="app-developer">${escapeHtml(app.developer)}</p>
                    <span class="app-category-badge">${app.category}</span>
                </div>
            </div>
            <p class="app-description">${escapeHtml(app.description)}</p>
            <div class="app-stats">
                <div class="app-stat">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V3M12 3L7 8M12 3L17 8M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${formatNumber(app.downloads || 0)}
                </div>
                <div class="app-stat">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    ${app.rating || '4.5'}
                </div>
                <div class="app-stat">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 10L12 15M12 15L7 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${app.size} MB
                </div>
            </div>
        </div>
    `).join('');

    // Add click listeners to app cards
    document.querySelectorAll('.app-card').forEach(card => {
        card.addEventListener('click', () => {
            const appId = card.dataset.appId;
            showAppDetail(appId);
        });
    });

    // Attach favorite button listeners if favoritesManager exists
    if (window.favoritesManager) {
        favoritesManager.attachListeners();
    }
}

// ==================== App Detail Page ====================
function showAppDetail(appId) {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;

    // Increment view count (optional)
    firebaseDB.collection('apps').doc(appId).update({
        views: (app.views || 0) + 1
    }).catch(err => console.log('View count update failed:', err));

    const screenshots = app.screenshots || [];
    const screenshotsHtml = screenshots.length > 0 ? `
        <div class="app-detail-section">
            <h3 class="detail-section-title">Screenshots</h3>
            <div class="screenshots-grid">
                ${screenshots.map(url => `
                    <img src="${url}" alt="Screenshot" class="screenshot" onerror="this.style.display='none'">
                `).join('')}
            </div>
        </div>
    ` : '';

    elements.appDetailContent.innerHTML = `
        <div class="app-detail-header">
            <img src="${app.iconUrl}" alt="${app.name}" class="app-detail-icon" onerror="this.src='https://via.placeholder.com/120?text=App'">
            <div class="app-detail-info">
                <h2 class="app-detail-title">${escapeHtml(app.name)}</h2>
                <p class="app-detail-developer">${escapeHtml(app.developer)}</p>
                <div class="app-detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">Version</span>
                        <span class="meta-value">${app.version}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Size</span>
                        <span class="meta-value">${app.size} MB</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Downloads</span>
                        <span class="meta-value">${formatNumber(app.downloads || 0)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Rating</span>
                        <span class="meta-value">⭐ ${app.rating || '4.5'}</span>
                    </div>
                </div>
                <a href="${app.downloadUrl}" class="download-button" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 10L12 15M12 15L7 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download Now
                </a>
            </div>
        </div>
        
        <div class="app-detail-section">
            <h3 class="detail-section-title">About this app</h3>
            <p class="app-detail-description">${escapeHtml(app.description)}</p>
        </div>
        
        ${screenshotsHtml}
    `;

    // Show detail page
    elements.storePage.classList.remove('active');
    elements.adminPage.classList.remove('active');
    elements.appDetailPage.classList.add('active');
}

// ==================== Admin Authentication ====================
function handleAdminLogin(e) {
    e.preventDefault();
    const password = elements.adminPassword.value;

    if (password === window.ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        elements.loginError.textContent = '';
        showAdminDashboard();
    } else {
        elements.loginError.textContent = 'Invalid password. Please try again.';
    }
}

function handleAdminLogout() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    showAdminLogin();
}

function showAdminLogin() {
    elements.adminLogin.style.display = 'flex';
    elements.adminDashboard.style.display = 'none';
    elements.adminPassword.value = '';
    elements.loginError.textContent = '';
}

function showAdminDashboard() {
    elements.adminLogin.style.display = 'none';
    elements.adminDashboard.style.display = 'block';
    updateStats();
    setTimeout(loadAdminApps, 100); // Ensure DOM is updated before attaching listeners
}

// ==================== Admin Dashboard ====================
function updateStats() {
    const totalApps = allApps.length;
    const totalDownloads = allApps.reduce((sum, app) => sum + (app.downloads || 0), 0);

    elements.totalAppsStat.textContent = totalApps;
    elements.totalDownloadsStat.textContent = formatNumber(totalDownloads);
}

function loadAdminApps() {
    if (allApps.length === 0) {
        elements.adminAppsList.innerHTML = `
            <p style="text-align: center; color: var(--text-muted); padding: 2rem;">
                No apps uploaded yet. Click "Upload New App" to get started.
            </p>
        `;
        return;
    }

    elements.adminAppsList.innerHTML = allApps.map(app => `
        <div class="admin-app-item" data-app-id="${app.id}">
            <img src="${app.iconUrl}" alt="${app.name}" class="admin-app-icon" onerror="this.src='https://via.placeholder.com/48?text=App'">
            <div class="admin-app-info">
                <div class="admin-app-name">${escapeHtml(app.name)}</div>
                <div class="admin-app-meta">${escapeHtml(app.developer)} • ${app.category} • ${formatNumber(app.downloads || 0)} downloads</div>
            </div>
            <div class="admin-app-actions">
                <button class="icon-btn edit-btn" data-app-id="${app.id}" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="icon-btn delete delete-btn" data-app-id="${app.id}" data-app-name="${escapeHtml(app.name)}" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.stopImmediatePropagation();
                const appId = btn.dataset.appId;
                console.log(`Edit button clicked for app: ${appId}`);
                openUploadModal(appId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const appId = btn.dataset.appId;
                const appName = btn.dataset.appName;
                console.log(`🗑️ Delete button clicked for app: ${appId} - ${appName}`);

                const confirmed = confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`);
                console.log(`User confirmation: ${confirmed}`);

                if (!confirmed) {
                    return;
                }

                // Show visual feedback
                const appItem = btn.closest('.admin-app-item');
                if (appItem) {
                    appItem.style.opacity = '0.5';
                    appItem.style.pointerEvents = 'none';
                }

                try {
                    console.log(`🔄 Deleting app from Firebase: ${appId}`);
                    await firebaseDB.collection('apps').doc(appId).delete();
                    console.log('✅ App deleted successfully from Firebase');
                    // Firebase onSnapshot will automatically update the UI via loadAdminApps()
                } catch (error) {
                    console.error('❌ Error deleting app:', error);
                    alert(`Failed to delete app: ${error.message}\n\nPlease check Firebase permissions and try again.`);
                    // Restore visual state on error
                    if (appItem) {
                        appItem.style.opacity = '1';
                        appItem.style.pointerEvents = 'auto';
                    }
                }
            }, true); // Use capture phase
        });
    });
}

// ==================== Upload Modal ====================
function openUploadModal(appId = null) {
    if (appId) {
        // Edit mode
        const app = allApps.find(a => a.id === appId);
        if (!app) return;

        elements.modalTitle.textContent = 'Edit App';
        elements.submitAppBtn.textContent = 'Update App';
        elements.appName.value = app.name;
        elements.appDeveloper.value = app.developer;
        elements.appCategory.value = app.category;
        elements.appVersion.value = app.version;
        elements.appDescription.value = app.description;
        elements.appSize.value = app.size;
        elements.appIconUrl.value = app.iconUrl;
        elements.appScreenshots.value = (app.screenshots || []).join(', ');
        elements.appDownloadUrl.value = app.downloadUrl;
        elements.editAppId.value = appId;
    } else {
        // Create mode
        elements.modalTitle.textContent = 'Upload New App';
        elements.submitAppBtn.textContent = 'Upload App';
        elements.uploadForm.reset();
        elements.editAppId.value = '';
    }

    elements.uploadModal.classList.add('active');
}

function closeUploadModal() {
    elements.uploadModal.classList.remove('active');
    elements.uploadForm.reset();
}

// ==================== App Upload/Edit ====================
async function handleAppUpload(e) {
    e.preventDefault();

    const appId = elements.editAppId.value;
    const screenshots = elements.appScreenshots.value
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .slice(0, 5);

    const appData = {
        name: elements.appName.value.trim(),
        developer: elements.appDeveloper.value.trim(),
        category: elements.appCategory.value,
        version: elements.appVersion.value.trim(),
        description: elements.appDescription.value.trim(),
        size: parseFloat(elements.appSize.value),
        iconUrl: elements.appIconUrl.value.trim(),
        screenshots: screenshots,
        downloadUrl: elements.appDownloadUrl.value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (appId) {
            // Update existing app
            await firebaseDB.collection('apps').doc(appId).update(appData);
            console.log('App updated successfully');
        } else {
            // Create new app
            appData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            appData.downloads = 0;
            appData.rating = 4.5;
            appData.views = 0;

            await firebaseDB.collection('apps').add(appData);
            console.log('App uploaded successfully');
        }

        closeUploadModal();
    } catch (error) {
        console.error('Error uploading app:', error);
        alert('Failed to upload app. Please try again.');
    }
}

// ==================== Utility Functions ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

console.log('✅ App initialized successfully');
